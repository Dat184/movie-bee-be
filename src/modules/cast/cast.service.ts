import { Injectable } from '@nestjs/common';
import { CreateCastDto } from './dto/create-cast.dto';
import { UpdateCastDto } from './dto/update-cast.dto';
import { Cast, CastDocument } from './schemas/cast.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import aqp from 'api-query-params';

@Injectable()
export class CastService {
  constructor(
    @InjectModel(Cast.name) private castModel: SoftDeleteModel<CastDocument>,
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

  update(id: string, updateCastDto: UpdateCastDto) {
    return `This action updates a #${id} cast`;
  }

  remove(id: string) {
    return `This action removes a #${id} cast`;
  }
}
