import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto, AuthRegisterDto } from './dto';
import { User } from '../users/entities';
import { AuthMeDto } from './dto/auth.me.dto';
import * as sgMail from '@sendgrid/mail';
import { AuthRecoverPasswordDto } from './dto/auth.recoverpassword.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService, private jwtService: JwtService) {}

  async register(authRegisterDto: AuthRegisterDto): Promise<User> {
    return this.userService.create(authRegisterDto);
  }

  async login(authLoginDto: AuthLoginDto): Promise<any> {
    const user = await this.userService.findOneBy({ email: authLoginDto.email }, true);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new BadRequestException('User not active.');
    }

    const hashPassword = this.userService.hashPassword(user.salt, authLoginDto.password);

    if (hashPassword != user.password) {
      throw new BadRequestException('Invalid credentials');
    }

    const jwt = await this.jwtService.signAsync({
      id: user.id,
      isAdmin: user.isAdmin
    });

    // Update user last login date and jwt token
    user.lastLogin = new Date();
    user.jwtToken = jwt;
    this.userService.update(user.id, user);

    return { jwt };
  }

  async forgotPassword(email: string): Promise<boolean> {
    // Generate random verification code
    const { randomInt } = await import('crypto');
    const n = randomInt(0, 1000000);
    const verificationCode = n.toString().padStart(6, '0');

    // Save code
    const user = await this.userService.findOneBy({ email }, true);
    user.updatedAt = new Date();
    user.verificationCode = verificationCode;
    this.userService.update(user.id, user);

    // Send email with code
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email,
      from: process.env.VERIFIED_EMAIL_FROM,
      subject: '[SPDS] Forgot password',
      html: `Hi ${user.firstName},<br/><br/>
      You requested a password recovery in our system.<br/>
      Please click on the link below to continue with the process and enter the following code when asked.<br/><br/>
      Your verification code: <strong>${verificationCode}</strong><br/>
      Link: <a href='https://acsp4hr.ml/auth/recover-password'>https://acsp4hr.ml/auth/recover-password</a><br/><br/>
      Thank you,<br/>
      SPDS Team`
    };
    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async recoverPassword(data: AuthRecoverPasswordDto): Promise<boolean> {
    const user = await this.userService.findOneBy({ email: data.email, verificationCode: data.verificationCode }, true);
    if (user) {
      let salt = user.salt;
      if (salt == null || salt == undefined || salt == '') {
        salt = this.userService.generateSalt();
        user.salt = salt;
      }
      const hashedPassword = this.userService.hashPassword(salt, data.password);
      user.password = hashedPassword;
      user.updatedAt = new Date();
      user.verificationCode = null;
      this.userService.update(user.id, user);
      return true;
    }
    return false;
  }

  getMe(id: number, includeSecrets = false): Promise<User> {
    return this.userService.findOneBy({ id: id }, includeSecrets);
  }

  updateMe(id: number, authMeDto: AuthMeDto) {
    return this.userService.update(id, authMeDto);
  }

  async logout(id: number) {
    const user = await this.userService.findOneBy({ id: id });
    user.jwtToken = null;
    this.userService.update(user.id, user);
  }

  async changePassword(id: number, oldPassword: string, newPassword) {
    return this.userService.updatePassword(id, oldPassword, newPassword);
  }
}
