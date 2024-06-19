import { Controller, Get, Post, Body, Patch, Delete, Put, Request, Query, Param } from '@nestjs/common';
import { BetsService } from './bets.service';
import { ResponseHandler } from 'helpers/ResponseHandler';
import { BetsQueryDto, CreateAdminBetDto, CreateBetViaWebDto, CreateGameTypeDto, CreateMatchDto, UpdateBetDto, UpdateBetStatusAndToWinAmountDto, UpdateGameTypeDto, UpdateMatchDto } from './dto/bets.dto';
import { BetStatusEnum } from './enum/bet.enum';

@Controller('api')
export class BetsController {
  constructor(private readonly betsService: BetsService) { }

  @Post('user/bet/create')
  async createBet(@Body() createBetDto: CreateBetViaWebDto, @Request() req): Promise<ResponseHandler> {
    const adminUser = req?.user;
    return this.betsService.createBet({ ...createBetDto, user: adminUser });
  }

  @Post("admin/bet/find-all")
  async findAllBets(@Body() body: BetsQueryDto, @Request() req): Promise<ResponseHandler> {
    return this.betsService.findAllBets(body, req?.user);
  }

  @Patch('admin/bet/approve/:betId')
  async approveBet(@Param('betId') betId: string, @Request() req,): Promise<ResponseHandler> {
    return this.betsService.updateBetStatus(betId, req?.user);
  }

  @Patch('admin/bet/update/:betId')
  async approveBetv2(@Param('betId') betId: string, @Request() req, @Body() body: UpdateBetStatusAndToWinAmountDto): Promise<ResponseHandler> {
    const adminUser = req.user;
    return this.betsService.updateBetStatusAndToWin(betId, adminUser, body);
  }

  @Post('admin/bet/create')
  async createAdminBet(@Body() createAdminBetDto: CreateAdminBetDto, @Request() req: any): Promise<ResponseHandler> {
    const adminUser = req.user;
    return this.betsService.createAdminBet(createAdminBetDto, adminUser);
  }

  @Post('admin/bet/accept/:betId')
  async acceptBet(@Param('betId') betId: string): Promise<ResponseHandler> {
    const updateBetDto: UpdateBetDto = { status: BetStatusEnum.APPROVED };
    return this.betsService.updateBet(betId, updateBetDto);
  }

  @Get('admin/bet/find-one/:betId')
  async findBetById(@Param('betId') betId: string): Promise<ResponseHandler> {
    return this.betsService.findBetById(betId);
  }

  ///////// MATCH      ////////

  @Post('admin/match/create')
  async createMatch(@Body() createBetDto: CreateMatchDto, @Request() req): Promise<ResponseHandler> {
    const adminUser = req.user;
    return this.betsService.createMatch(createBetDto, adminUser);
  }

  @Patch('admin/match/update/:id')
  async updateMatch(@Body() updateMatchDto: UpdateMatchDto, @Param('id') id: string): Promise<ResponseHandler> {
    return this.betsService.updateMatch(id, updateMatchDto);
  }

  @Get('user/match/find-one/:id')
  async findOneMatch(@Query('id') id: string): Promise<ResponseHandler> {
    return this.betsService.findOneMatch(id);
  }

  @Post('/user/match/find-all')
  async findAllMatches(@Body() body: any, @Request() req: any): Promise<ResponseHandler> {
    const adminUser = req.user;
    console.log("asaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    return this.betsService.findAllMatchesV2(body, adminUser);
  }

  @Delete('admin/match/delete/:id')
  async deleteMatch(@Param('id') id: any): Promise<ResponseHandler> {
    return this.betsService.deleteMatch(id);
  }

  /////////GAME TYPE ///////////
  @Post('admin/game-type/create')
  async createGameType(@Body() Body: CreateGameTypeDto, @Request() req: any): Promise<ResponseHandler> {
    const adminUser = req.user;
    return this.betsService.createGameType(Body, adminUser);
  }

  @Get('user/game-type/find-all')
  async findAllGameType(): Promise<ResponseHandler> {
    return this.betsService.findAllGameType();
  }

  @Get('user/game-type/find-one/:id')
  async findOneGameType(@Param('id') id: any): Promise<ResponseHandler> {
    return this.betsService.findOneGameType(id);
  }

  @Patch('admin/game-type/update/:id')
  async updateGameType(@Param('id') id: any, @Body() body: UpdateGameTypeDto, @Request() req: any): Promise<ResponseHandler> {
    const adminUser = req.user;
    return this.betsService.updateGameType(id, body, adminUser);
  }

  @Delete('admin/game-type/delete/:id')
  async deleteGameType(@Param('id') id: string, @Request() req: any): Promise<ResponseHandler> {
    const adminUser = req.user;
    return this.betsService.removeGameType(id, adminUser);
  }


  // @Post('accept/:betId')
  // async acceptBet(@Param('betId') betId: number, @Body('userId') userId: number): Promise<ResponseHandler> {
  //   return this.betsService.acceptBet(betId, userId);
  // }
}
