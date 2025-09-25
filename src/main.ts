import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // config view engine ejs to render our HTML views
  app.useStaticAssets(join(__dirname, '..', 'public')); // serve static files from the "public" directory like CSS, JS, images
  app.setBaseViewsDir(join(__dirname, '..', 'views')); // set the directory for view templates
  app.setViewEngine('ejs');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// config --watch trong package.json để chạy chế độ watch khi có thay đổi trong mã nguồn, server sẽ tự động reload lại
