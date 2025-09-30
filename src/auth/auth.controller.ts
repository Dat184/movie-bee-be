import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { IUser } from 'src/users/users.interface';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
