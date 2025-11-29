import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Movie, MovieDocument } from './schemas/movie.schemas';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { AppException } from 'src/exception/app.exception';
import aqp from 'api-query-params';
import {
  MovieGenre,
  MovieGenreDocument,
} from '../movie-genre/schemas/movie-genre.schemas';
import {
  MovieCast,
  MovieCastDocument,
} from '../movie-cast/schemas/movie-cast.schemas';
import { mongo } from 'mongoose';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: SoftDeleteModel<MovieDocument>,
    @InjectModel(MovieGenre.name)
    private movieGenreModel: SoftDeleteModel<MovieGenreDocument>,
    @InjectModel(MovieCast.name)
    private movieCastModel: SoftDeleteModel<MovieCastDocument>,

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

    // Lấy secure_url từ response
    const posterPath = posterResponse.secure_url;
    const backdropPath = backdropResponse.secure_url;

    // xử lý Cast và Genre
    const { genreIds, castIds } = createMovieDto;

    const newMovie = await this.movieModel.create({
      ...createMovieDto,
      isDisplay: false,
      posterPath,
      backdropPath,
    });

    if (genreIds.length > 0) {
      await this.movieGenreModel.insertMany(
        genreIds.map((genreId) => ({
          movieId: newMovie._id, // sẽ cập nhật sau
          genreId,
        })),
      );
    }
    if (castIds.length > 0) {
      await this.movieCastModel.insertMany(
        castIds.map((castId) => ({
          movieId: newMovie._id, // sẽ cập nhật sau
          castId,
        })),
      );
    }
    return newMovie;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    // ✅ Fix: Cast sort hoặc provide default
    const sortStage = (sort as any) || { createdAt: -1 };

    // Aggregation pipeline
    const result = await this.movieModel.aggregate([
      { $match: filter },

      // Lookup genres
      {
        $lookup: {
          from: 'moviegenres',
          localField: '_id',
          foreignField: 'movieId',
          as: 'movieGenres',
        },
      },
      {
        $lookup: {
          from: 'genres',
          localField: 'movieGenres.genreId',
          foreignField: '_id',
          as: 'genres',
        },
      },

      // Lookup casts
      {
        $lookup: {
          from: 'moviecasts',
          localField: '_id',
          foreignField: 'movieId',
          as: 'movieCasts',
        },
      },
      {
        $lookup: {
          from: 'casts',
          localField: 'movieCasts.castId',
          foreignField: '_id',
          as: 'casts',
        },
      },

      // ✅ Sort with proper type
      { $sort: sortStage },

      // Pagination
      { $skip: offset },
      { $limit: defaultLimit },

      // Project
      {
        $project: {
          movieGenres: 0,
          movieCasts: 0,
        },
      },
    ]);

    const totalItems = await this.movieModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findBannerMovies() {
    return await this.movieModel
      .find({ isBanner: true, isDisplay: true })
      .sort({ releaseDate: -1 })
      .limit(10)
      .populate('genres', 'name')
      .exec();
  }

  async findOne(id: string) {
    if (!mongo.ObjectId.isValid(id)) {
      throw new AppException({
        message: 'Not found Movie',
        errorCode: 'MOVIE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const movie = await this.movieModel.findOne({ _id: id }).exec();
    if (!movie) {
      throw new AppException({
        message: 'Not found Movie',
        errorCode: 'MOVIE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const genres = await this.movieGenreModel
      .find({ movieId: id })
      .populate('genreId', 'name')
      .exec();
    const casts = await this.movieCastModel
      .find({ movieId: id })
      .populate('castId', 'name')
      .exec();
    return { ...movie.toObject(), genres, casts };
  }

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    if (!mongo.ObjectId.isValid(id)) {
      throw new AppException({
        message: 'Not found Movie',
        errorCode: 'MOVIE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const { genreIds, castIds } = updateMovieDto;
    const updatedMovie = await this.movieModel.updateOne(
      { _id: id },
      updateMovieDto,
    );
    if (genreIds) {
      await this.movieGenreModel.deleteMany({ movieId: id });
      if (genreIds.length > 0) {
        await this.movieGenreModel.insertMany(
          genreIds.map((genreId) => ({
            movieId: id,
            genreId,
          })),
        );
      }
    }
    if (castIds) {
      await this.movieCastModel.deleteMany({ movieId: id });
      if (castIds.length > 0) {
        await this.movieCastModel.insertMany(
          castIds.map((castId) => ({
            movieId: id,
            castId,
          })),
        );
      }
    }
    return updatedMovie;
  }

  remove(id: string) {
    return this.movieModel.softDelete({ _id: id });
  }
}
