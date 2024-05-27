import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { ReviewCategoryEntity } from './entities/review_categories.entity';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity, ReviewCategoryEntity, UserEntity]),
  ], controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule { }
