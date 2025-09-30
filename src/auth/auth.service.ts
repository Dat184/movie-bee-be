import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from 'src/exception/app.exception';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new AppException({
        message: 'User with this email not found',
        errorCode: 'USER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const isValid = this.usersService.isValidPassword(pass, user.password);
    if (user && isValid) {
      const userObject = user.toObject();
      const { password, ...result } = userObject;
      return result;
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const payload = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      gender: user.gender,
      isVerified: user.isVerified,
      sub: 'token login',
      iss: 'from server',
    };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.generateRefreshToken(payload);
    const refreshExpiresIn: string =
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') ||
      '1d';
    const maxAge: number = ms(refreshExpiresIn as ms.StringValue) ?? 0;

    const accessExpiresIn: string =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') ||
      '15m';
    const accessMaxAge: number = ms(accessExpiresIn as ms.StringValue) ?? 0;
    // luu refresh token vao cookie
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: maxAge,
      sameSite: 'none',
    });
    // luu access token trong cookie
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      maxAge: accessMaxAge,
      sameSite: 'none',
    });

    return {
      access_token,
      user: {
        email: user.email,
      },
    };
  }

  private generateRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      ),
    });
    return refresh_token;
  };

  async handleRefreshToken(refreshToken: string, response: Response) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findOne(payload._id);

      const newPayload = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        gender: user.gender,
        isVerified: user.isVerified,
        sub: 'token refresh',
        iss: 'from server',
      };

      const newAccessToken = this.jwtService.sign(newPayload);

      const newRefreshToken = this.generateRefreshToken(newPayload);

      const refreshExpiresIn: string =
        this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') ||
        '1d';
      const maxAge: number = ms(refreshExpiresIn as ms.StringValue) ?? 0;
      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: maxAge,
        sameSite: 'none',
      });
      const accessExpiresIn: string =
        this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') ||
        '15m';
      const accessMaxAge: number = ms(accessExpiresIn as ms.StringValue) ?? 0;
      // luu access token trong cookie
      response.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: true,
        maxAge: accessMaxAge,
        sameSite: 'none',
      });

      return {
        access_token: newAccessToken,
        user: {
          email: user.email,
        },
      };
    } catch (error) {
      response.clearCookie('refresh_token');
      console.log(error);

      throw new AppException({
        message: 'Invalid refresh token',
        errorCode: 'INVALID_REFRESH_TOKEN',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
  }

  async getMyProfile(payload: IUser) {
    return payload;
  }
}
