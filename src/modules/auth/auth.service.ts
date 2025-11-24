import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from 'src/exception/app.exception';
import { UsersService } from 'src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/modules/users/users.interface';
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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user.password) {
      throw new AppException({
        message:
          'This account was created with Google. Please use Google Sign-In.',
        errorCode: 'GOOGLE_ACCOUNT',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (user.isVerified === false) {
      throw new AppException({
        message: 'Email not verified. Please verify your email before login.',
        errorCode: 'EMAIL_NOT_VERIFIED',
        statusCode: HttpStatus.BAD_REQUEST,
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
      isVerified: user.isVerified,
      avatar: user.avatar,
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
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
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
        isVerified: user.isVerified,
        avatar: user.avatar,
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
    const user = await this.usersService.findOne(payload._id);
    return user;
  }

  async logout(response: Response) {
    response.clearCookie('refresh_token');
    response.clearCookie('access_token');
    return 'ok';
  }

  async validateGoogleUser(profile: any) {
    const user = await this.usersService.findOneByEmail(profile.email);
    if (user) {
      return user;
    }
    // If user doesn't exist, create a new one
    const newUser = await this.usersService.create(profile);
    return newUser;
  }
}
