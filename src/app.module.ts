import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    // ConfigModule.forRoot() để tìm kiếm file env nào sử dụng và validate các biến môi trường trong file env đó
    ConfigModule.forRoot({
      isGlobal: true, // để có thể sử dụng ConfigModule ở bất kỳ module nào mà không cần import lại
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
