import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Genre, GenreDocument } from './schemas/genre.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { AppException } from 'src/exception/app.exception';
import aqp from 'api-query-params';
import {
  MovieGenre,
  MovieGenreDocument,
} from '../movie-genre/schemas/movie-genre.schemas';

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genre.name) private genreModel: SoftDeleteModel<GenreDocument>,
    @InjectModel(MovieGenre.name)
    private movieGenreModel: SoftDeleteModel<MovieGenreDocument>,
  ) {}
  async create(createGenreDto: CreateGenreDto) {
    const isExist = await this.genreModel.findOne({
      name: createGenreDto.name,
    });
    if (isExist) {
      throw new AppException({
        message: 'Genre with this name already exists',
        errorCode: 'GENRE_ALREADY_EXISTS',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const newGenre = await this.genreModel.create(createGenreDto);
    return newGenre;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.genreModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.genreModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select(projection)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    const genre = await this.genreModel.findById(id);
    if (!genre) {
      throw new AppException({
        message: 'Genre not found',
        errorCode: 'GENRE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return genre;
  }

  async update(id: string, updateGenreDto: UpdateGenreDto) {
    const genre = await this.genreModel.findOne({ _id: id });
    if (!genre) {
      throw new AppException({
        message: 'Genre not found',
        errorCode: 'GENRE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const updatedGenre = await this.genreModel.updateOne(
      { _id: id },
      { ...updateGenreDto },
    );
    return updatedGenre;
  }

  async remove(id: string) {
    const genre = await this.genreModel.findOne({ _id: id });
    if (!genre) {
      throw new AppException({
        message: 'Genre not found',
        errorCode: 'GENRE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const existingInMovie = await this.movieGenreModel
      .findOne({ genreId: id })
      .exec();
    if (existingInMovie) {
      throw new AppException({
        message: 'Cannot delete genre that is associated with movies',
        errorCode: 'GENRE_IN_USE',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    return await this.genreModel.softDelete({ _id: id });
  }
}
