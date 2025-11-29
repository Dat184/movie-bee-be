import { Module } from '@nestjs/common';
import { MovieGenreService } from './movie-genre.service';
import { MovieGenreController } from './movie-genre.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieGenre, MovieGenreSchema } from './schemas/movie-genre.schemas';

@Module({
  controllers: [MovieGenreController],
  providers: [MovieGenreService],
  imports: [
    MongooseModule.forFeature([
      { name: MovieGenre.name, schema: MovieGenreSchema },
    ]),
  ],
})
export class MovieGenreModule {}
