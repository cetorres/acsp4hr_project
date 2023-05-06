import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserChangePasswordDto, UserCreateDto, UserUpdateDto } from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() userCreateDto: UserCreateDto) {
    const savedUser = await this.usersService.create(userCreateDto);
    delete savedUser.password;
    return savedUser;
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneBy({ id: id });
  }

  @Put(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() userUpdateDto: UserUpdateDto) {
    return this.usersService.update(+id, userUpdateDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }

  @Put(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  updatePassword(@Param('id') id: string, @Body() data: UserChangePasswordDto) {
    return this.usersService.updatePassword(+id, data.oldPassword, data.newPassword);
  }

  @Get('/admin/fill-up-secure-token')
  @Roles(Role.Admin)
  async fillUpSecureToken() {
    return this.usersService.fillUpSecureToken();
  }
}
