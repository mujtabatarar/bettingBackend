import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ForgotPasswordDto, IdDto, LoginDto, ResetPasswordDto, SignupDto, UpdateUserDto, UserFilterDto } from './dto/user.dto';
import { ResponseData, ResponseHandler } from 'helpers/ResponseHandler';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from './entities/user.entity';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { errorMessage } from 'constants/messages';
// const bcrypt = require('bcrypt');
// import { bcrypt } from 'bcrypt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import appConfig from 'config/appConfig';


@Injectable()
export class UsersService {

  constructor(

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private jwtService: JwtService,
    private mailerService: MailerService

  ) { }

  async create(data: SignupDto): Promise<ResponseHandler> {
    try {
      const userQuery = await this.userRepository.createQueryBuilder('user');
      userQuery.where('user.email = :email', { email: data.email });
      userQuery.orWhere('user.phoneNumber = :phoneNumber', { phoneNumber: data.phoneNumber });
      const result = await userQuery.getOne();
      if (result?.email === data.email) {
        return ResponseData.error(
          HttpStatus.NOT_ACCEPTABLE,
          errorMessage.USER_ALREADY_EXISTS,
        );
      }
      if (result?.phoneNumber === data.phoneNumber) {
        return ResponseData.error(
          HttpStatus.NOT_ACCEPTABLE,
          errorMessage.PHONE_NO_ALLREADY_IN_USE,
        );
      }


      // Create and save the new user
      const user = this.userRepository.create(data);
      const createdUser = await this.userRepository.save(user);

      // Return the created user data
      return ResponseData.success(createdUser);
    } catch (err) {
      // this.logger.error(`create -> error: ${JSON.stringify(err)}`);
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || errorMessage.SOMETHING_WENT_WRONG,
      );
    }
  }


  async login(data: LoginDto): Promise<ResponseHandler> {
    try {
      console.log("1-1--1-1-1-1--1--1-1");
      const user = await this.userRepository.findOne({ where: { email: data.email } });
      if (!user) {
        return ResponseData.error(
          HttpStatus.NOT_FOUND,
          errorMessage.USER_NOT_FOUND,
        );
      }

      console.log(user.password);
      console.log(data.password);
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        return ResponseData.error(
          HttpStatus.UNAUTHORIZED,
          errorMessage.INVALID_CREDENTIALS,
        );
      }

      const jwtUser = {
        id: user.id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        isAdmin: user.isAdmin
      }

      // Generate a JWT token for the user
      const token = await this.jwtService.signAsync(jwtUser);

      // Return the user data and the token
      return ResponseData.success({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userName: user.userName,
          phoneNumber: user.phoneNumber,
          isAdmin: user.isAdmin
        },
        token,
      });
    } catch (err) {
      // this.logger.error(`login -> error: ${JSON.stringify(err)}`);
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || errorMessage.SOMETHING_WENT_WRONG,
      );
    }
  }

  async update(id: string, data: UpdateUserDto): Promise<ResponseHandler> {
    try {
      // Attempt to find and update the user by ID
      // const { id } = query;
      const existingUser = await this.userRepository.findOne({ where: { id } });

      if (!existingUser) {
        return ResponseData.error(
          HttpStatus.NOT_FOUND,
          errorMessage.USER_NOT_FOUND,
        );
      }

      if (data.userName || data.phoneNumber) {
        const userQuery = await this.userRepository.createQueryBuilder('user');
        if (data.userName) {
          userQuery.orWhere('user.userName = :userName', { userName: data.userName });
        }
        if (data.phoneNumber) {
          userQuery.orWhere('user.phoneNumber = :phoneNumber', { phoneNumber: data.phoneNumber });
        }
        const result = await userQuery.getOne();
        if (result?.id != id) {
          if (result?.phoneNumber === data.phoneNumber && result?.phoneNumber != undefined) {
            return ResponseData.error(
              HttpStatus.NOT_ACCEPTABLE,
              errorMessage.PHONE_NO_ALLREADY_IN_USE,
            );
          }
          if (result?.userName === data.userName && result?.userName != undefined) {
            return ResponseData.error(
              HttpStatus.NOT_ACCEPTABLE,
              errorMessage.USER_NAME_ALLREADY_TAKEN,
            );
          }
        }
      }

      // Update the user entity with new data
      await this.userRepository.update(id, data);
      const updatedUser = await this.userRepository.findOne({ where: { id } });

      // Return the updated user data
      return ResponseData.success(updatedUser);
    } catch (err) {
      // this.logger.error(`update -> error: ${JSON.stringify(err.message)}`);
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || errorMessage.SOMETHING_WENT_WRONG,
      );
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ResponseHandler> {
    try {
      const { email } = forgotPasswordDto;
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordToken = await bcrypt.hash(resetToken, 10);
      const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpires = resetPasswordExpires;

      await this.userRepository.save(user);

      const resetUrl = `${appConfig().frontEndUrl}/reset-password?token=${resetToken}&email=${email}`;
      console.log(resetToken);
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'forgot-password', // Create this template
        context: {
          name: user.name,
          resetUrl,
        },
      });
      return ResponseData.success("Reset Link have been sent to you email address")
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || errorMessage.SOMETHING_WENT_WRONG,
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResponseData> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: Not(IsNull()),
        resetPasswordExpires: MoreThan(new Date())
      }
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);

    if (!isTokenValid) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);
    return ResponseData.success("Passwords updated successfully")
  } catch(err) {
    // this.logger.error(`update -> error: ${JSON.stringify(err.message)}`);
    return ResponseData.error(
      HttpStatus.BAD_REQUEST,
      err?.message || errorMessage.SOMETHING_WENT_WRONG,
    );
  }

  async findAllUsers(filterDto: UserFilterDto, adminUser: any): Promise<ResponseHandler> {
    if (!adminUser.isAdmin) {
      return ResponseData.error(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
    const { email, name, userName, isAdmin, phoneNumber, page = 1, limit = 10 } = filterDto;
    const query = this.userRepository.createQueryBuilder('user');

    if (email) {
      query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }

    if (userName) {
      query.andWhere('user.userName ILIKE :userName', { userName: `%${userName}%` });
    }

    if (phoneNumber) {
      query.andWhere('user.phoneNumber ILIKE :phoneNumber', { phoneNumber: `%${phoneNumber}%` });
    }

    if (isAdmin !== undefined) {
      query.andWhere('user.isAdmin = :isAdmin', { isAdmin });
    }

    query.skip((page - 1) * limit).take(limit);

    try {
      const [users, total] = await query.getManyAndCount();
      return ResponseData.success({ users, total, page, limit });
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }
}

