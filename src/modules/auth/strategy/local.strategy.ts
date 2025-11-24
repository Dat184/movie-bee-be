import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AppException } from 'src/exception/app.exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new AppException({
        message: 'Invalid Username/Password !',
        errorCode: 'INVALID_CREDENTIALS',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
    return user;
  }
}
