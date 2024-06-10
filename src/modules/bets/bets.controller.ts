import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Request } from '@nestjs/common';
import { BetsService } from './bets.service';
import { ResponseHandler } from 'helpers/ResponseHandler';
import { CreateAdminBetDto, CreateBetViaWebDto, UpdateBetDto } from './dto/bets.dto';

@Controller('api/bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) { }

  @Post('create')
  async createBet(@Body() createBetDto: CreateBetViaWebDto, @Request() req): Promise<ResponseHandler> {
    const user = req.user;
    return this.betsService.createBet({ ...createBetDto, user: user });
  }

  @Put('approve/:betId')
  async approveBet(@Param('betId') betId: string, @Request() req): Promise<ResponseHandler> {
    const user = req.user;
    return this.betsService.acceptBet(betId, user);
  }

  @Post('admin/create')
  async createAdminBet(@Body() createAdminBetDto: CreateAdminBetDto): Promise<ResponseHandler> {
    return this.betsService.createAdminBet(createAdminBetDto);
  }

  @Post('accept/:betId')
  async acceptBet(@Param('betId') betId: string): Promise<ResponseHandler> {
    const updateBetDto: UpdateBetDto = { status: 'Locked' };
    return this.betsService.updateBet(betId, updateBetDto);
  }

  @Get(':betId')
  async findBetById(@Param('betId') betId: string): Promise<ResponseHandler> {
    return this.betsService.findBetById(betId);
  }

  @Get()
  async findAllBets(): Promise<ResponseHandler> {
    return this.betsService.findAllBets();
  }



  // @Post('accept/:betId')
  // async acceptBet(@Param('betId') betId: number, @Body('userId') userId: number): Promise<ResponseHandler> {
  //   return this.betsService.acceptBet(betId, userId);
  // }
}
