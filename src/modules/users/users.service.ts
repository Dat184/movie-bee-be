import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, GoogleCreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User as UserM, UserDocument } from './schemas/user.schemas';
import mongoose, { mongo } from 'mongoose';
import aqp from 'api-query-params';
import { AppException } from 'src/exception/app.exception';
import { MailService } from 'src/modules/mail/mail.service';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { IUser } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    private mailService: MailService,
    private cloudinaryService: CloudinaryService,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async create(createUserDto: GoogleCreateUserDto) {
    const { email, firstName, lastName, avatar, isVerified } = createUserDto;
    // user ton tai da kiem tra ben auth service
    const newUser = await this.userModel.create({
      email,
      firstName,
      lastName,
      avatar,
      isVerified,
    });
    return newUser;
  }

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;
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
    // mã hóa mật khẩu trước khi lưu vào database
    const hashedPassword = this.getHashedPassword(password);
    // tạo otp
    const VerifiedOTP = this.generateOtp();
    const otpExpirationTime = new Date(Date.now() + 5 * 60 * 1000);
    // avatar default
    const defaultAvatar =
      'http://res.cloudinary.com/dd27hbc2d/image/upload/v1762152948/products/qifq83xzyrvao1pf6n4u.jpg';

    const newUser = await this.userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      OTP: VerifiedOTP,
      otpExpirationTime,
      avatar: defaultAvatar,
    });

    await this.mailService.sendOtpEmail(email, {
      name: `${firstName} ${lastName}`,
      otp: VerifiedOTP,
      otpExpirationTime,
    });

    return {
      _id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      avatar: newUser.avatar,
    };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new AppException({
        message: 'Not found user',
        errorCode: 'USER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (user.OTP !== otp) {
      throw new AppException({
        message: 'Invalid OTP',
        errorCode: 'INVALID_OTP',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (new Date() > user.otpExpirationTime) {
      throw new AppException({
        message: 'OTP has expired',
        errorCode: 'OTP_EXPIRED',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    await this.userModel.updateOne(
      { email },
      {
        $set: { isVerified: true },
        $unset: { OTP: '', otpExpirationTime: '' },
      },
    );

    return {
      message: 'Email verified successfully',
    };
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
      .select('-password -OTP -otpExpirationTime')
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
    if (!mongo.ObjectId.isValid(id)) {
      throw new AppException({
        message: 'Not found user',
        errorCode: 'USER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const user = await this.userModel
      .findOne({ _id: id })
      .select('-password -OTP -otpExpirationTime')
      .exec();
    if (!user) {
      throw new AppException({
        message: 'Not found user',
        errorCode: 'USER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!mongo.ObjectId.isValid(id)) {
      throw new AppException({
        message: 'Not found user',
        errorCode: 'USER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const user = await this.userModel
      .findOne({ _id: id })
      .select('-password -OTP -otpExpirationTime')
      .exec();
    if (!user) {
      throw new AppException({
        message: 'Not found user',
        errorCode: 'USER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const updated = await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
      },
    );
    return updated;
  }

  async remove(id: string) {
    const foundUser = await this.isExistUser(id);
    if (foundUser.email === 'admin@gmail.com') {
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
    if (!hash) {
      return false;
    }
    return compareSync(password, hash);
  }

  isExistUser = async (id: string) => {
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

  async uploadAvatar(user: IUser, file: Express.Multer.File) {
    const userId = user._id;
    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      'products',
    );
    await this.userModel.updateOne(
      { _id: userId },
      { avatar: uploadResult.url },
    );
    return {
      message: 'Avatar uploaded successfully',
      avatar: uploadResult.url,
    };
  }
}
