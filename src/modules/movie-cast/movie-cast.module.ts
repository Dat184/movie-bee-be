import { Module } from '@nestjs/common';
import { MovieCastService } from './movie-cast.service';
import { MovieCastController } from './movie-cast.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieCast, MovieCastSchema } from './schemas/movie-cast.schemas';

@Module({
  controllers: [MovieCastController],
  providers: [MovieCastService],
  imports: [
    MongooseModule.forFeature([
      { name: MovieCast.name, schema: MovieCastSchema },
    ]),
  ],
})
export class MovieCastModule {}
