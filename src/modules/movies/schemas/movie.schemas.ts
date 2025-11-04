import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop()
  overview?: string;

  @Prop()
  posterPath: string;

  @Prop()
  backdropPath: string;

  @Prop()
  imdbRating: string;

  @Prop()
  trailerUrl?: string;

  @Prop()
  IsBanner?: boolean;

  @Prop()
  isDisplay: boolean;

  @Prop()
  releaseDate?: Date;
}

export type MovieDocument = HydratedDocument<Movie>;
export const MovieSchema = SchemaFactory.createForClass(Movie);
