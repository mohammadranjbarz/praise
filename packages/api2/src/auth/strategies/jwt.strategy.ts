import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '@/users/users.service';
import { AuthContext } from '../auth-context';
import { Types } from 'mongoose';

@Injectable()
/**
 * Passport strategy for authenticating users using JWT.
 */
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: JwtPayload): AuthContext | null {
    return { ...payload, userId: new Types.ObjectId(payload.userId) };
  }
}
