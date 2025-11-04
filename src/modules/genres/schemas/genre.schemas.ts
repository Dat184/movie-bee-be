import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Genre {
  @Prop({ required: true })
  name: string;
}

export type GenreDocument = HydratedDocument<Genre>;
export const GenreSchema = SchemaFactory.createForClass(Genre);
