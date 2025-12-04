import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Public, ResponseMessage, Roles } from 'src/decorator/customize';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UserRole } from 'src/enums/user-role';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Created movie successfully')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFiles()
    files: {
      poster?: Express.Multer.File[];
      backdrop?: Express.Multer.File[];
    },
  ) {
    const poster = files?.poster?.[0] || null;
    const backdrop = files?.backdrop?.[0] || null;
    return this.moviesService.create(createMovieDto, { poster, backdrop });
  }

  @Get()
  @Public()
  @ResponseMessage('Retrieved all movies successfully')
  async findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.moviesService.findAll(+currentPage, +limit, qs);
  }

  @Get('playlist')
  @Public()
  @ResponseMessage('Retrieved playlist movies successfully')
  async findPlaylistMovies(@Query() qs: string) {
    return this.moviesService.findPlaylistMovies(qs);
  }

  @Get('banner')
  @Public()
  @ResponseMessage('Retrieved banner movies successfully')
  async findBannerMovies() {
    return this.moviesService.findBannerMovies();
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @UploadedFiles()
    files: {
      poster?: Express.Multer.File[];
      backdrop?: Express.Multer.File[];
    },
  ) {
    const poster = files?.poster?.[0] || null;
    const backdrop = files?.backdrop?.[0] || null;
    return this.moviesService.update(id, updateMovieDto, { poster, backdrop });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.moviesService.remove(id);
  }
}
