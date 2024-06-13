import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { UserEntity } from '../users/entities/user.entity';
import { BetsEntity } from './entities/bets.entity';
import { MatchEntity } from './entities/match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BetsEntity, UserEntity, MatchEntity]),
    MailerModule,
  ],
  controllers: [BetsController],
  providers: [BetsService],
})
export class BetsModule { }
