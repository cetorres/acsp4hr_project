import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserChangePasswordDto } from '../users/dto/user.change-password.dto';
import { AuthService } from './auth.service';
import { AuthLoginDto, AuthRegisterDto } from './dto';
import { AuthForgotPasswordDto } from './dto/auth.forgotpassword.dto';
import { AuthMeDto } from './dto/auth.me.dto';
import { AuthRecoverPasswordDto } from './dto/auth.recoverpassword.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() data: AuthRegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: AuthLoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(data);
    response.cookie('jwt', result.jwt, { httpOnly: true, secure: true, sameSite: true });
    return {
      success: true
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() data: AuthForgotPasswordDto) {
    const result = await this.authService.forgotPassword(data.email);
    return {
      success: result
    };
  }

  @Post('recover-password')
  @HttpCode(HttpStatus.OK)
  async recoverPassword(@Body() data: AuthRecoverPasswordDto) {
    const result = await this.authService.recoverPassword(data);
    return {
      success: result
    };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getMe(@Req() request: Request) {
    return request.user;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('me')
  async updateMe(@Req() request: Request, @Body() data: AuthMeDto) {
    return this.authService.updateMe(request.user['id'], data);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('change-password')
  async changePassword(@Req() request: Request, @Body() data: UserChangePasswordDto) {
    return this.authService.changePassword(request.user['id'], data.oldPassword, data.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return this.authService.logout(request.user['id']);
  }
}
