import {
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppException } from 'src/exception/app.exception';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { username, password } = request.body;

    // Validate trước khi Passport xử lý
    if (!username || username === '') {
      throw new AppException({
        message: 'Username is required',
        errorCode: 'USERNAME_REQUIRED',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (!password || password === '') {
      throw new AppException({
        message: 'Password is required',
        errorCode: 'PASSWORD_REQUIRED',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return super.canActivate(context);
  }
}