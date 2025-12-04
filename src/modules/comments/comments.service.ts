import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Comment, CommentDocument } from './schemas/comment.schemas';
import { IUser } from '../users/users.interface';
import { MoviesService } from '../movies/movies.service';
import aqp from 'api-query-params';
import { AppException } from 'src/exception/app.exception';
import { ModerationService } from '../moderation/moderation.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: SoftDeleteModel<CommentDocument>,
    private moviesService: MoviesService,
    private moderationService: ModerationService,
  ) {}
  async create(createCommentDto: CreateCommentDto, user: IUser) {
    const { movieId, content } = createCommentDto;
    const isExistMovie = await this.moviesService.findOne(movieId);
    const moderationResult = await this.moderationService.checkComment(content);

    const newComment = await this.commentModel.create({
      ...createCommentDto,
      userId: user._id,
      isSafe: moderationResult.isSafe,
    });
    return newComment;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.commentModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.commentModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .populate('userId', 'email lastName firstName avatar')
      .populate('movieId', 'title')
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
    const isExist = (await this.commentModel.findById(id).exec()).populate(
      'userId',
      'email lastName firstName avatar',
    );
    if (!isExist) {
      throw new AppException({
        message: 'Comment not found',
        errorCode: 'COMMENT_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return isExist;
  }

  async findOnebyMovieID(movieId: string, currentPage: number, limit: number) {
    // Kiểm tra movie có tồn tại không
    await this.moviesService.findOne(movieId);

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    // Filter chỉ lấy comment có isSafe = true
    const filter = {
      movieId,
      isSafe: true,
      isDeleted: { $ne: true },
    };

    const totalItems = await this.commentModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.commentModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .populate('userId', 'email lastName firstName avatar')
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  update(id: string, updateCommentDto: UpdateCommentDto) {
    const isExist = this.commentModel.findById(id).exec();
    if (!isExist) {
      throw new AppException({
        message: 'Comment not found',
        errorCode: 'COMMENT_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const updatedComment = this.commentModel.updateOne(
      { _id: id },
      { ...updateCommentDto },
    );
    return updatedComment;
  }

  remove(id: string) {
    return this.commentModel.softDelete({ _id: id });
  }
}
