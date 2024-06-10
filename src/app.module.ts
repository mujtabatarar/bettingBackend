import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReviewModule } from './modules/review/review.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'config/typeOrmConfig';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { BetsModule } from './modules/bets/bets.module';
import appConfiguration from 'config/appConfig';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from 'config/mailer.config';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      load: [appConfiguration],
    }),
    MailerModule.forRoot(mailerConfig),
    ReviewModule,
    UsersModule,
    BetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
