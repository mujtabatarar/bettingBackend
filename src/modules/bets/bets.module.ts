import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { BetEntity } from './entities/bets.entity';
import { WagesEntity } from './entities/bets.entity';
import { UserEntity } from '../users/entities/user.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([BetEntity, UserEntity, WagesEntity]),
    MailerModule,
  ],
  controllers: [BetsController],
  providers: [BetsService],
})
export class BetsModule { }
