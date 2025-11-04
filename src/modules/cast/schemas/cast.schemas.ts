import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Movie } from 'src/modules/movies/schemas/movie.schemas';

@Schema({ timestamps: true })
export class Cast {
  @Prop({ required: true })
  name: string;

  @Prop()
  avatarPath: string;
}

export type CastDocument = HydratedDocument<Cast>;
export const CastSchema = SchemaFactory.createForClass(Cast);