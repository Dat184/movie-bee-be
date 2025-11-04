import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Movie, MovieDocument } from './schemas/movie.schemas';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { AppException } from 'src/exception/app.exception';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: SoftDeleteModel<MovieDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}
  async create(
    createMovieDto: CreateMovieDto,
    files: { poster?: Express.Multer.File; backdrop?: Express.Multer.File },
  ) {
    const isExist = await this.movieModel.findOne({
      title: createMovieDto.title,
    });
    if (isExist) {
      throw new AppException({
        message: 'Movie already exists',
        errorCode: 'MOVIE_ALREADY_EXISTS',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const { poster, backdrop } = files;
    const posterResponse = await this.cloudinaryService.uploadFile(
      poster,
      'posters',
    );
    const backdropResponse = await this.cloudinaryService.uploadFile(
      backdrop,
      'backdrops',
    );

    // ✅ Lấy secure_url từ response
    const posterPath = posterResponse.secure_url;
    const backdropPath = backdropResponse.secure_url;

    const newMovie = await this.movieModel.create({
      ...createMovieDto,
      posterPath,
      backdropPath,
    });
    return newMovie;
  }

  findAll() {
    return `This action returns all movies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} movie`;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
