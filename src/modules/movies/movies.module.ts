import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './schemas/movie.schemas';
import { MovieGenreModule } from '../movie-genre/movie-genre.module';
import { MovieCastModule } from '../movie-cast/movie-cast.module';
import {
  MovieCast,
  MovieCastSchema,
} from '../movie-cast/schemas/movie-cast.schemas';
import {
  MovieGenre,
  MovieGenreSchema,
} from '../movie-genre/schemas/movie-genre.schemas';

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
  ],
  exports: [MoviesService],
})
export class MoviesModule {}
