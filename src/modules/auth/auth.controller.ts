import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { IUser } from 'src/modules/users/users.interface';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { UsersService } from 'src/modules/users/users.service';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { GoogleAuthGuard } from './guard/google.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @Public()
  @ResponseMessage('User logged in successfully')
  @UseGuards(LocalAuthGuard)
  async login(
    @User() user: IUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @Post('refresh')
  @Public()
  @ResponseMessage('Access token refreshed successfully')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = request.cookies['refresh_token'];
    return this.authService.handleRefreshToken(refresh_token, response);
  }

  @Get('profile')
  @ResponseMessage('User profile fetched successfully')
  async getProfile(@User() user: IUser) {
    return this.authService.getMyProfile(user);
  }

  @Post('logout')
  @ResponseMessage('User logged out successfully')
  async logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  @Post('verify-email')
  @Public()
  @ResponseMessage('Email verified successfully')
  verifyEmail(@Body('email') email: string, @Body('otp') otp: string) {
    return this.usersService.verifyEmail(email, otp);
  }

  @Post('register')
  @Public()
  @ResponseMessage('User created successfully')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get('google/login')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Get('google/callback')
  @Public()
  @ResponseMessage('Google login successful')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @User() user: IUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(user, res);
  }
}
