import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, mongo } from 'mongoose';
import { Movie } from 'src/modules/movies/schemas/movie.schemas';
import { User } from 'src/modules/users/schemas/user.schemas';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Movie.name,
    required: true,
  })
  movieId: mongoose.Schema.Types.ObjectId;

  @Prop()
  isSafe: boolean;
}

export type CommentDocument = HydratedDocument<Comment>;
export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.index({ movieId: 1, createdAt: -1 }); // Lấy comments của movie, sort by newest
