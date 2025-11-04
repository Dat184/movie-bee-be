import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Movie, MovieDocument } from './schemas/movie.schemas';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { AppException } from 'src/exception/app.exception';
import aqp from 'api-query-params';

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

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.movieModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.movieModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select(projection as any)
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

  async findAllEnabled(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.movieModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.movieModel
      .find(filter, { isDisplay: true })
      .skip(offset)
      .limit(defaultLimit)
      .sort({ imdbRating: -1 })
      .select(projection as any)
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

  async findBannerMovies() {
    return await this.movieModel
      .find({ isBanner: true, isDisplay: true })
      .sort({ releaseDate: -1 })
      .limit(10)
      .populate('genres', 'name')
      .exec();
  }

  findOne(id: number) {
    return this.movieModel.findById(id).exec();
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
