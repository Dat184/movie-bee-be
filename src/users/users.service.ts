import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User as UserM, UserDocument } from './schemas/user.schemas';
import mongoose, { mongo } from 'mongoose';
import aqp from 'api-query-params';
import { AppException } from 'src/exception/app.exception';
import { UserGender } from 'src/enums/user-gender';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, age, gender } = createUserDto;
    const existsUser = await this.userModel.findOne({
      email,
    });
    if (existsUser) {
      throw new AppException({
        message: 'User with this email already exists',
        errorCode: 'USER_ALREADY_EXISTS',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const hashedPassword = this.getHashedPassword(password);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      gender,
    });

    const result = await newUser.save();
    return { ...result.toObject(), password: undefined };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
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
    return this.notFoundUser(id);
  }

  async findOneByUsername(username: string) {
    const user = await this.userModel.findOne({ email: username }).exec();
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.notFoundUser(id);
    const updated = await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
      },
    );
    return updated;
  }

  async remove(id: string) {
    const foundUser = await this.notFoundUser(id);
    if (foundUser && foundUser.email === 'admin@gmail.copm') {
      throw new AppException({
        message: 'Cannot delete admin user',
        errorCode: 'CANNOT_DELETE_ADMIN',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
    return this.userModel.softDelete({ _id: id });
  }

  getHashedPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  notFoundUser = async (id: string) => {
    if (!mongo.ObjectId.isValid(id)) {
      throw new AppException({
        message: 'Not found user',
        errorCode: 'USER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const user = await this.userModel
      .findOne({ _id: id })
      .select('-password')
      .exec();
    if (!user) {
      throw new AppException({
        message: 'Not found user',
        errorCode: 'USER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return user;
  };
}
