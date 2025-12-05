import { forwardRef, Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './schemas/movie.schemas';
import {
  MovieCast,
  MovieCastSchema,
} from '../movie-cast/schemas/movie-cast.schemas';
import {
  MovieGenre,
  MovieGenreSchema,
} from '../movie-genre/schemas/movie-genre.schemas';
import { CastModule } from '../cast/cast.module';
import { VideoModule } from '../video/video.module';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: MovieCast.name, schema: MovieCastSchema },
      { name: MovieGenre.name, schema: MovieGenreSchema },
    ]),
    CloudinaryModule,
    CastModule,
    forwardRef(() => VideoModule),
  ],
  exports: [MoviesService],
})
export class MoviesModule {}
