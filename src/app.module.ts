import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReviewModule } from './modules/review/review.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'config/typeOrmConfig';
import { ConfigModule } from '@nestjs/config';
import appConfiguration from 'config/appConfig';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      load: [appConfiguration],
    }),
    ReviewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
