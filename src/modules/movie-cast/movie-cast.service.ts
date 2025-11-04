import { Injectable } from '@nestjs/common';
import { CreateMovieCastDto } from './dto/create-movie-cast.dto';
import { UpdateMovieCastDto } from './dto/update-movie-cast.dto';

@Injectable()
export class MovieCastService {
  create(createMovieCastDto: CreateMovieCastDto) {
    return 'This action adds a new movieCast';
  }

  findAll() {
    return `This action returns all movieCast`;
  }

  findOne(id: number) {
    return `This action returns a #${id} movieCast`;
  }

  update(id: number, updateMovieCastDto: UpdateMovieCastDto) {
    return `This action updates a #${id} movieCast`;
  }

  remove(id: number) {
    return `This action removes a #${id} movieCast`;
  }
}
