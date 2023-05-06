import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['jwt'];
        }
      ])
    });
  }

  async validate(payload: any) {
    let user = await this.authService.getMe(payload.id, true);
    if (!user.jwtToken) return false;
    user = this.usersService.removeSecrets(user);
    return user;
  }
}
