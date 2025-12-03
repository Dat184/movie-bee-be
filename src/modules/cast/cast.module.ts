import { Module } from '@nestjs/common';
import { CastService } from './cast.service';
import { CastController } from './cast.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cast, CastSchema } from './schemas/cast.schemas';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import {
  MovieCast,
  MovieCastSchema,
} from '../movie-cast/schemas/movie-cast.schemas';

@Module({
  controllers: [CastController],
  providers: [CastService],
  imports: [
    MongooseModule.forFeature([
      { name: Cast.name, schema: CastSchema },
      { name: MovieCast.name, schema: MovieCastSchema },
    ]),

    CloudinaryModule,
  ],
  exports: [CastService],
})
export class CastModule {}
