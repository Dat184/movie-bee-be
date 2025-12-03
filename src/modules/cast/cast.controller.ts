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
  Query,
  Res,
} from '@nestjs/common';
import { CastService } from './cast.service';
import { CreateCastDto } from './dto/create-cast.dto';
import { UpdateCastDto } from './dto/update-cast.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseMessage, Roles } from 'src/decorator/customize';
import { UserRole } from 'src/enums/user-role';

@Controller('cast')
export class CastController {
  constructor(private readonly castService: CastService) {}

  @Post()
  @ResponseMessage('Created cast successfully')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createCastDto: CreateCastDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.castService.create(createCastDto, file);
  }

  @Get()
  @ResponseMessage('Cast fetched successfully')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.castService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Cast fetched successfully')
  findOne(@Param('id') id: string) {
    return this.castService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Cast updated successfully')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateCastDto: UpdateCastDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.castService.update(id, updateCastDto, file);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Cast removed successfully')
  remove(@Param('id') id: string) {
    return this.castService.remove(id);
  }
}
