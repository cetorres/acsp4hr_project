import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { AuthRegisterDto } from 'src/auth/dto';
import { AuthMeDto } from 'src/auth/dto/auth.me.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');

@Injectable()
export class UsersService {
  security_iterations: number;
  security_keylen: number;
  security_digest: string;

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {
    this.security_iterations = 1000;
    this.security_keylen = 64;
    this.security_digest = 'sha512';
  }

  async create(userCreateDto: UserCreateDto | AuthRegisterDto) {
    try {
      // Create user salt and password hash
      const salt = this.generateSalt();
      const hashedPassword = this.hashPassword(salt, userCreateDto.password);

      userCreateDto.password = hashedPassword;
      userCreateDto.salt = salt;

      const newUser = this.userRepository.create(userCreateDto);
      await this.userRepository.save(newUser);

      delete newUser.password;
      delete newUser.salt;
      return newUser;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  // Create a unique salt for the user
  generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // Create a random secure token for the user
  generateRandomSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hashing user's salt and password with 1000 iterations and creating a 64 bytes key
  hashPassword(salt: string, password: string): string {
    return crypto
      .pbkdf2Sync(password, salt, this.security_iterations, this.security_keylen, this.security_digest)
      .toString('hex');
  }

  async countAll() {
    const total = await this.userRepository.count({ where: { isActive: true } });
    return total;
  }

  async findAll(includeSecrets = false) {
    const [users, total] = await this.userRepository.findAndCount({
      order: { firstName: 'ASC', lastName: 'ASC' }
    });
    if (!includeSecrets) {
      users.map((user) => {
        user = this.removeSecrets(user);
        return user;
      });
    }
    return { data: users, total };
  }

  async findOneBy(condition: any, includeSecrets = false) {
    try {
      let user = await this.userRepository.findOneByOrFail(condition);
      if (!includeSecrets) {
        user = this.removeSecrets(user);
      }
      return user;
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async update(id: number, userUpdateDto: UserUpdateDto | AuthMeDto) {
    try {
      await this.userRepository.update(id, userUpdateDto);
      const user = await this.userRepository.findOneBy({ id });
      return this.removeSecrets(user);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async delete(id: number) {
    await this.userRepository.softDelete(id);
  }

  async updatePassword(id: number, oldPassword: string, newPassword: string) {
    try {
      const user = await this.userRepository.findOneByOrFail({ id: id });

      const hashOldPassword = this.hashPassword(user.salt, oldPassword);

      if (hashOldPassword != user.password) {
        throw new ForbiddenException();
      }

      const hashNewPassword = this.hashPassword(user.salt, newPassword);
      user.password = hashNewPassword;
      this.userRepository.save(user);
    } catch (e) {
      if (e.message == 'Forbidden') throw new ForbiddenException();
      throw new NotFoundException();
    }
  }

  async fillUpSecureToken() {
    const users = await this.userRepository.find({
      where: { secureToken: IsNull() }
    });

    users.forEach(async (user) => {
      const secureToken = this.generateRandomSecureToken();
      await this.userRepository.update(user.id, { secureToken: secureToken });
    });

    return true;
  }

  removeSecrets(user: User) {
    delete user.password;
    delete user.salt;
    delete user.jwtToken;
    delete user.secureToken;
    delete user.verificationCode;
    return user;
  }
}
