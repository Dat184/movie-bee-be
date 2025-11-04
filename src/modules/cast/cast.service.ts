import { Injectable } from '@nestjs/common';
import { CreateCastDto } from './dto/create-cast.dto';
import { UpdateCastDto } from './dto/update-cast.dto';
import { Cast, CastDocument } from './schemas/cast.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

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

  findAll() {
    return `This action returns all cast`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cast`;
  }

  update(id: number, updateCastDto: UpdateCastDto) {
    return `This action updates a #${id} cast`;
  }

  remove(id: number) {
    return `This action removes a #${id} cast`;
  }
}
