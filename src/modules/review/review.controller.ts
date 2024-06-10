import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReviewService } from './review.service';
import { CreateCompleteReviewDto, CreateReviewDto, UpdateHelpfulDto } from './dto/review.dto';
import { ResponseData } from 'helpers/ResponseHandler';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  // @MessagePattern('createReview')
  @Post('create')
  createFullReview(@Body() body: CreateCompleteReviewDto) {
    this.reviewService.createCompleteReview(body);
    return ResponseData.success({
      message: 'Review created successfully'
    });
  }

  @Get('get/:roomId')
  async getReviewStatisticsByRoomId(@Param('roomId') roomId: string) {
    return await this.reviewService.getReviewStatisticsByRoom(roomId);
  }

  @Get('get/two/:roomId')
  async getReviewStatisticsByRoomIdTwo(@Param('roomId') roomId: string) {
    return await this.reviewService.getReviewStatisticsByRoom2(roomId);
  }

  @Get('get/three/:roomId')
  async getReviewStatisticsByRoomIdThree(@Param('roomId') roomId: string) {
    return await this.reviewService.getReviewStatisticsByRoom3(roomId);
  }

  @Get('get/four/:roomId')
  async getReviewStatisticsByRoomIdFour(@Param('roomId') roomId: string) {
    return await this.reviewService.getReviewStatisticsByRoom4(roomId);
  }

  @Get('get/five/:roomId')
  async getReviewStatisticsByRoomIdFive(@Param('roomId') roomId: string) {
    return await this.reviewService.getReviewStatisticsByRoom5(roomId);
  }

  @Get('get/six/:roomId')
  async getReviewStatisticsByRoomIdSix(@Param('roomId') roomId: string) {
    return await this.reviewService.getReviewStatisticsByRoom6(roomId);
  }

  @Post('create/helpfull')
  async updateHelpfulCountNew(@Body() body: UpdateHelpfulDto) {
    return await this.reviewService.updateHelpfulCountNew(body);
  }

}
