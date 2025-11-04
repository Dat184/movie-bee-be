import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MovieCastService } from './movie-cast.service';
import { CreateMovieCastDto } from './dto/create-movie-cast.dto';
import { UpdateMovieCastDto } from './dto/update-movie-cast.dto';

@Controller('movie-cast')
export class MovieCastController {
  constructor(private readonly movieCastService: MovieCastService) {}

  @Post()
  create(@Body() createMovieCastDto: CreateMovieCastDto) {
    return this.movieCastService.create(createMovieCastDto);
  }

  @Get()
  findAll() {
    return this.movieCastService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movieCastService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieCastDto: UpdateMovieCastDto) {
    return this.movieCastService.update(+id, updateMovieCastDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movieCastService.remove(+id);
  }
}
