import { Module } from '@nestjs/common';
import { CastService } from './cast.service';
import { CastController } from './cast.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cast, CastSchema } from './schemas/cast.schemas';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [CastController],
  providers: [CastService],
  imports: [
    MongooseModule.forFeature([{ name: Cast.name, schema: CastSchema }]),
    CloudinaryModule,
  ],
})
export class CastModule {}
