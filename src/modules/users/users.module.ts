import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import appConfig from 'config/appConfig';

@Module({
  imports: [
    JwtModule.register({
      secret: appConfig().JwtSecret,
      signOptions: { expiresIn: appConfig().JwtExpires },
    }),
    TypeOrmModule.forFeature([UserEntity]),
    // JwtModule,
    MailerModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
