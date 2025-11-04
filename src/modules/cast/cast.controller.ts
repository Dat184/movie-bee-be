import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CastService } from './cast.service';
import { CreateCastDto } from './dto/create-cast.dto';
import { UpdateCastDto } from './dto/update-cast.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cast')
export class CastController {
  constructor(private readonly castService: CastService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createCastDto: CreateCastDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.castService.create(createCastDto, file);
  }

  @Get()
  findAll() {
    return this.castService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.castService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCastDto: UpdateCastDto) {
    return this.castService.update(+id, updateCastDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.castService.remove(+id);
  }
}
