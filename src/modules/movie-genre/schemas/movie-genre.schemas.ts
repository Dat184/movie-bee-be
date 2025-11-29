import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Genre } from 'src/modules/genres/schemas/genre.schemas';
import { Movie } from 'src/modules/movies/schemas/movie.schemas';

@Schema({ timestamps: true })
export class MovieGenre {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Movie.name,
    required: true,
  })
  movieId: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Genre.name,
    required: true,
  })
  genreId: mongoose.Schema.Types.ObjectId;
}

export type MovieGenreDocument = HydratedDocument<MovieGenre>;
export const MovieGenreSchema = SchemaFactory.createForClass(MovieGenre);
