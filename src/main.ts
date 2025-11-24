import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './inteceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // set up global guard
  const reflector = app.get('Reflector');
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  // set up global interceptor
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  // config view engine ejs to render our HTML views (Server-Side Rendering)
  app.useStaticAssets(join(__dirname, '..', 'public')); // serve static files from the "public" directory like CSS, JS, images
  app.setBaseViewsDir(join(__dirname, '..', 'views')); // set the directory for view templates
  app.setViewEngine('ejs');

  // enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // set up global prefix and versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  app.use(cookieParser());
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // console.log(configService.get<string>('MONGO_URL'));
  await app.listen(configService.get<string>('PORT'));
}
bootstrap();

// config --watch trong package.json để chạy chế độ watch khi có thay đổi trong mã nguồn, server sẽ tự động reload lại
