import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCastDto } from './dto/create-cast.dto';
import { UpdateCastDto } from './dto/update-cast.dto';
import { Cast, CastDocument } from './schemas/cast.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import aqp from 'api-query-params';
import { AppException } from 'src/exception/app.exception';
import {
  MovieCast,
  MovieCastDocument,
} from '../movie-cast/schemas/movie-cast.schemas';

@Injectable()
export class CastService {
  constructor(
    @InjectModel(Cast.name) private castModel: SoftDeleteModel<CastDocument>,
    @InjectModel(MovieCast.name)
    private movieCastModel: SoftDeleteModel<MovieCastDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}
  async create(createCastDto: CreateCastDto, file: Express.Multer.File) {
    const imageUrl = await this.cloudinaryService.uploadFile(file, 'cast');
    const createdCast = await this.castModel.create({
      ...createCastDto,
      avatarPath: imageUrl.secure_url,
    });
    return createdCast;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.castModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.castModel
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

  async findOne(id: string) {
    return await this.castModel.findById(id).exec();
  }

  async update(
    id: string,
    updateCastDto: UpdateCastDto,
    file: Express.Multer.File,
  ) {
    const existingCast = await this.castModel.findById(id).exec();
    if (!existingCast) {
      throw new AppException({
        message: 'Cast not found',
        errorCode: 'CAST_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (file) {
      await this.cloudinaryService.deleteFile(
        this.extractPublicId(existingCast.avatarPath),
        'cast',
      );
      const imageUrl = await this.cloudinaryService.uploadFile(file, 'cast');
      const updatedCast = await this.castModel.updateOne(
        { _id: id },
        {
          ...updateCastDto,
          avatarPath: imageUrl.secure_url,
        },
      );
      return updatedCast;
    }
    const updatedCast = await this.castModel.updateOne(
      { _id: id },
      {
        ...updateCastDto,
      },
    );
    return updatedCast;
  }

  async remove(id: string) {
    const existingCast = await this.castModel.findById(id).exec();
    if (!existingCast) {
      throw new AppException({
        message: 'Cast not found',
        errorCode: 'CAST_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const existingInMovie = await this.movieCastModel
      .findOne({ castId: id })
      .exec();
    if (existingInMovie) {
      throw new AppException({
        message: 'Cannot delete cast associated with movies',
        errorCode: 'CAST_ASSOCIATED_WITH_MOVIES',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    await this.cloudinaryService.deleteFile(
      this.extractPublicId(existingCast.avatarPath),
      'cast',
    );
    return await this.castModel.deleteOne({ _id: id }).exec();
  }

  extractPublicId(avatarPath: string): string {
    const pathString = String(avatarPath);
    if (!pathString || pathString === 'undefined' || pathString === 'null') {
      throw new AppException({
        message: 'Invalid avatar path',
        errorCode: 'INVALID_AVATAR_PATH',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const parts = pathString.split('/');
    const fileNameWithExtension = parts[parts.length - 1];
    const publicId = fileNameWithExtension.split('.')[0];
    console.log(publicId);
    return publicId;
  }
}
