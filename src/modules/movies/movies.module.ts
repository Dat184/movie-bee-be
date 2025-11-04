import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './schemas/movie.schemas';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    CloudinaryModule,
  ],
  exports: [MoviesService],
})
export class MoviesModule {}
