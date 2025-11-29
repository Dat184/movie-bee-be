import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schemas';
import { MoviesModule } from '../movies/movies.module';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MoviesModule,
    ModerationModule,
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
