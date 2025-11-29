import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from './modules/mail/mail.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { MoviesModule } from './modules/movies/movies.module';
import { GenresModule } from './modules/genres/genres.module';
import { CastModule } from './modules/cast/cast.module';
import { MovieCastModule } from './modules/movie-cast/movie-cast.module';
import { MovieGenreModule } from './modules/movie-genre/movie-genre.module';
import { CommentsModule } from './modules/comments/comments.module'; 
import { ModerationModule } from './modules/moderation/moderation.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    // ConfigModule.forRoot() để tìm kiếm file env nào sử dụng và validate các biến môi trường trong file env đó
    ConfigModule.forRoot({
      isGlobal: true, // để có thể sử dụng ConfigModule ở bất kỳ module nào mà không cần import lại
    }),
    UsersModule,
    AuthModule,
    MailModule,
    CloudinaryModule,
    MoviesModule,
    GenresModule,
    CastModule,
    MovieCastModule,
    MovieGenreModule,
    CommentsModule,
    ModerationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // {
    //  set up global guard
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule {}
