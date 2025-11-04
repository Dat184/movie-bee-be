import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { ResponseMessage, Roles } from 'src/decorator/customize';
import { UserRole } from 'src/enums/user-role';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Created genre successfully')
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  @ResponseMessage('Genres fetched successfully')
  findAll(@Query() qs: string) {
    return this.genresService.findAll(qs);
  }

  @Get(':id')
  @ResponseMessage('Genre fetched successfully')
  findOne(@Param('id') id: string) {
    return this.genresService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Genre updated successfully')
  update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genresService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Genre deleted successfully')
  remove(@Param('id') id: string) {
    return this.genresService.remove(id);
  }
}
