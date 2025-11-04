import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Movie } from 'src/modules/movies/schemas/movie.schemas';
import { Cast } from 'src/modules/cast/schemas/cast.schemas';

@Schema({ timestamps: true })
export class MovieCast {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Movie.name,
    required: true,
  })
  movieId: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Cast.name,
    required: true,
  })
  castId: mongoose.Schema.Types.ObjectId;
}

export type MovieCastDocument = HydratedDocument<MovieCast>;
export const MovieCastSchema = SchemaFactory.createForClass(MovieCast);
