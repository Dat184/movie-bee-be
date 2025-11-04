import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Genre, GenreDocument } from './schemas/genre.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { AppException } from 'src/exception/app.exception';
import aqp from 'api-query-params';

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genre.name) private genreModel: SoftDeleteModel<GenreDocument>,
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

  async findAll(qs: string) {
    const { filter, population } = aqp(qs);
    const genres = await this.genreModel
      .find(filter)
      .populate(population)
      .exec();
    return genres;
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

  remove(id: string) {
    return this.genreModel.softDelete({ _id: id });
  }
}
