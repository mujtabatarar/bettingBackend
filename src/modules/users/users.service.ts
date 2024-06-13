import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ForgotPasswordDto, IdDto, LoginDto, ResetPasswordDto, SignupDto, UpdateUserDto } from './dto/user.dto';
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
      // Check if a user with the same email already exists
      const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
      if (existingUser) {
        return ResponseData.error(
          HttpStatus.CONFLICT,
          errorMessage.USER_ALREADY_EXISTS,
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

      // Generate a JWT token for the user
      const token = await this.jwtService.signAsync({ userId: user.id });

      // Return the user data and the token
      return ResponseData.success({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
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

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'forgot-password', // Create this template
        context: {
          name: user.name,
          resetUrl,
        },
      });
    } catch (err) {
      // this.logger.error(`update -> error: ${JSON.stringify(err.message)}`);
      // return ResponseData.error(
      //   HttpStatus.BAD_REQUEST,
      //   err?.message || errorMessage.SOMETHING_WENT_WRONG,
      // );
      console.log("forgotPassword");
      console.log(err.message);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
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
  } catch(err) {
    // this.logger.error(`update -> error: ${JSON.stringify(err.message)}`);
    return ResponseData.error(
      HttpStatus.BAD_REQUEST,
      err?.message || errorMessage.SOMETHING_WENT_WRONG,
    );
  }
}

