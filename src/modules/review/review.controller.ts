import { Controller, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ResponseData } from 'helpers/ResponseHandler';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @MessagePattern('createReview')
  create(@Payload() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Get('room/:roomId')
  async getReviewStatisticsByRoomId(@Param('roomId') roomId: string): Promise<ResponseData> {
    const statistics = await this.reviewService.getReviewStatisticsByRoom(roomId);
    return ResponseData.success(statistics);
  }
}
