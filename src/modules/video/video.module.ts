import { forwardRef, Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { MoviesModule } from '../movies/movies.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from '../movies/schemas/movie.schemas';

@Module({
  controllers: [VideoController],
  providers: [VideoService],
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    forwardRef(() => MoviesModule),
  ],
  exports: [VideoService],
})
export class VideoModule {}
