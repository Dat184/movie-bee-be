import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from '../users/users.interface';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ResponseMessage('Created comment successfully')
  create(@Body() createCommentDto: CreateCommentDto, @User() user: IUser) {
    return this.commentsService.create(createCommentDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Retrieved all comments successfully')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.commentsService.findAll(+currentPage, +limit, qs);
  }

  @Get('movie/:movieId')
  @Public()
  @ResponseMessage('Retrieved comments by movie ID successfully')
  findOnebyMovieID(
    @Param('movieId') movieId: string,
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
  ) {
    return this.commentsService.findOnebyMovieID(movieId, +currentPage, +limit);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Retrieved comment successfully')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Updated comment successfully')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @ResponseMessage('Deleted comment successfully')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
