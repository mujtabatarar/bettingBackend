import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, MoreThan, MoreThanOrEqual, IsNull } from 'typeorm';
import { ResponseData, ResponseHandler } from 'helpers/ResponseHandler';
import { BetsQueryDto, CreateAdminBetDto, CreateBetViaWebDto, CreateGameTypeDto, CreateMatchDto, UpdateBetDto, UpdateGameTypeDto, UpdateMatchDto } from './dto/bets.dto';
import { MailerService } from '@nestjs-modules/mailer';
import appConfig from 'config/appConfig';
import { UserEntity } from '../users/entities/user.entity';
import { BetStatusEnum, MatchTypeEnum } from './enum/bet.enum';
import * as cron from 'node-cron';
import { MatchEntity } from './entities/match.entity';
import { BetsEntity } from './entities/bets.entity';
import { GameTypeEntity } from './entities/gameType.entity';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,

    @InjectRepository(BetsEntity)
    private betsRepository: Repository<BetsEntity>,

    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,

    @InjectRepository(GameTypeEntity)
    private gameTypeRepository: Repository<GameTypeEntity>,

    private mailerService: MailerService

  ) { }

  async createBet(createBetDto: CreateBetViaWebDto): Promise<ResponseHandler> {
    try {

      const user = await this.usersRepository.findOne({ where: { id: createBetDto.user.id } });
      if (!user) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'User not found');
      }

      const match = await this.matchRepository.findOne({ where: { id: createBetDto.matchId, isLocked: false } })
      if (!match) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'Match not found, or is allready locked.');
      }

      // Check if a bet already exists for the same match and user
      const existingBet = await this.betsRepository.findOne({
        where: {
          createdBy: createBetDto.user.id,
          matchId: createBetDto.matchId,
        },
      });

      if (existingBet) {
        return ResponseData.error(HttpStatus.CONFLICT, 'A bet already exists for this match and user.');
      }

      const bet = this.betsRepository.create({ ...createBetDto, status: BetStatusEnum.PENDING_APPROVAL, user: user, createdBy: user.id, match: match });
      const createdBet = await this.betsRepository.save(bet);

      // Send email for approval
      // this.mailerService.sendMail({
      //   to: appConfig().SuperAdminEmail,
      //   subject: 'New Bet Approval Required',
      //   text: `A new bet has been created. And waiting for being approved. Details: ${bet.description}, Amount: ${bet.wagerAmount}, Category: ${match.gameType}. Creator username: ${user.username} and email: ${user.email}`,
      // });
      await this.mailerService.sendMail({
        to: appConfig().SuperAdminEmail,
        from: appConfig().fromEmail,
        subject: 'New Bet Approval Required',
        template: 'bet-create', // the file name of the template without extension
        context: {
          description: bet.description,
          wagerAmount: bet.wagerAmount,
          gameType: match.gameType,
          username: user.userName,
          email: user.email,
        },
      });
      console.log("1-1-1-1--1--1-1-1--1");
      return ResponseData.success(createdBet);
    } catch (err) {
      console.log(err);

      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async getAllPendingBets(matchId?: string): Promise<ResponseHandler> {
    try {
      let bets: any;
      if (matchId) {
        bets = await this.betsRepository.findOne({ where: { matchId: matchId } });
      } else {
        bets = await this.betsRepository.find();
      }
      if (!bets) {
        return ResponseData.error(
          HttpStatus.NOT_FOUND,
          'Bets not found',
        );
      }
      return ResponseData.success(bets);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async updateBetStatus(betId: string, adminUser: any): Promise<ResponseHandler> {
    try {
      if (!adminUser.isAdmin) {
        return ResponseData.error(HttpStatus.UNAUTHORIZED, "Unauthorized");
      }
      const bet = await this.betsRepository.findOne({ where: { id: betId } });
      if (!bet) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'Bet not found');
      }

      // if (bet.status !== BetStatusEnum.APPROVED) {
      //   return ResponseData.error(HttpStatus.BAD_REQUEST, 'Bet allready approved');
      // }

      bet.status = BetStatusEnum.APPROVED;
      bet.acceptedBy = adminUser;
      const updatedBet = await this.betsRepository.save(bet);

      // Optionally send confirmation emails to involved users
      const betOwner = await this.usersRepository.findOne({ where: { id: bet.createdBy } });

      await this.mailerService.sendMail({
        to: appConfig().SuperAdminEmail,
        from: appConfig().fromEmail,
        subject: 'Bet approved.',
        template: 'bet-approved', // the file name of the template without extension
        context: {
          wagerAmount: bet.wagerAmount,
        },
      });
      return ResponseData.success(updatedBet);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async updateBetStatusAndToWin(betId: string, adminUser: any, body: any): Promise<ResponseHandler> {
    try {
      if (adminUser.isAdmin === false) {
        return ResponseData.error(HttpStatus.UNAUTHORIZED, "Unauthorized");
      }
      const bet = await this.betsRepository.findOne({ where: { id: betId } });
      if (!bet) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'Bet not found');
      }

      // if (bet.status !== BetStatusEnum.PENDING_APPROVAL) {
      //   return ResponseData.error(HttpStatus.BAD_REQUEST, 'Bet cannot be accepted');
      // }

      bet.status = body.status;
      bet.toWinAmount = body.toWinAmount;
      bet.acceptedBy = adminUser;
      const updatedBet = await this.betsRepository.save(bet);

      // Optionally send confirmation emails to involved users
      const betOwner = await this.usersRepository.findOne({ where: { id: bet.createdBy } });

      if (body.status === BetStatusEnum.APPROVED) {
        await this.mailerService.sendMail({
          to: betOwner.email,
          from: appConfig().fromEmail,
          subject: 'Bet Approved.',
          template: 'bet-approved', // the file name of the template without extension
          context: {
            wagerAmount: bet.wagerAmount,
          },
        });
      } else if (body.status === BetStatusEnum.REJECTED) {
        await this.mailerService.sendMail({
          to: betOwner.email,
          from: appConfig().fromEmail,
          subject: 'Bet Rejected.',
          template: 'bet-rejected', // the file name of the template without extension
          context: {
            wagerAmount: bet.wagerAmount,
          },
        });
      }

      return ResponseData.success(updatedBet);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async updateBet(id: string, param: UpdateBetDto): Promise<ResponseHandler> {
    try {
      await this.betsRepository.update(id, param);
      const updatedBet = await this.betsRepository.findOne({ where: { id } });
      if (!updatedBet) {
        return ResponseData.error(
          HttpStatus.NOT_FOUND,
          'Bet not found',
        );
      }
      return ResponseData.success(updatedBet);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async findBetById(id: string): Promise<ResponseHandler> {
    try {
      const bet = await this.betsRepository.findOne({ where: { id } });
      if (!bet) {
        return ResponseData.error(
          HttpStatus.NOT_FOUND,
          'Bet not found',
        );
      }
      return ResponseData.success(bet);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async findAllBets(filters: BetsQueryDto, user: any): Promise<ResponseHandler> {
    try {
      if (!user.isAdmin) {
        return ResponseData.error(HttpStatus.UNAUTHORIZED, "Unauthorized");
      }
      console.table(filters);
      const findOptions: FindManyOptions<BetsEntity> = {
        where: {
          status: filters.status || undefined,
          createdBy: filters.createdBy || undefined,
          matchId: filters.matchId || undefined,
          description: filters.description || undefined,
          wagerAmount: filters.wagerAmount ? MoreThanOrEqual(filters.wagerAmount) : undefined,
          toWinAmount: filters.toWinAmount === null
            ? IsNull()
            : filters.toWinAmount !== undefined
              ? MoreThanOrEqual(filters.toWinAmount)
              : undefined,
          acceptedBy: filters.acceptedBy
            ? { id: filters.acceptedBy } // Assuming you filter by acceptedBy's id
            : undefined,
        },
        relations: ['user', 'match', 'acceptedBy'], // Load related entities if needed
      };

      const bets = await this.betsRepository.find(findOptions);
      return ResponseData.success(bets);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }


  async findBetsOfMatch(matchId: string): Promise<ResponseHandler> {
    try {
      const match = await this.matchRepository.findOne({ where: { id: matchId } });
      if (!match) {
        return ResponseData.error(HttpStatus.BAD_REQUEST, 'No Match found');
      }
      const bets = await this.betsRepository.findOne({ where: { matchId: matchId } });
      return ResponseData.success({ match: match, bets: bets });
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }



  async createAdminBet(createAdminBetDto: CreateAdminBetDto, adminUser: any): Promise<ResponseHandler> {
    try {
      const user = await this.usersRepository.findOne({ where: { email: createAdminBetDto.userEmail } });
      if (!user) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'User not found');
      }

      const match = await this.matchRepository.findOne({ where: { id: createAdminBetDto.matchId, isLocked: false } })
      if (!match) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'Match not found, or is allready locked.');
      }

      // Check if a bet already exists for the same match and user
      const existingBet = await this.betsRepository.findOne({
        where: {
          createdBy: user.id,
          matchId: match.id,
        },
      });

      if (existingBet) {
        return ResponseData.error(HttpStatus.CONFLICT, 'User already place bet on this match.');
      }
      const betObject = {
        description: createAdminBetDto.description,
        wagerAmount: createAdminBetDto.wagerAmount,
        toWinAmount: createAdminBetDto.toWinAmount,
        status: BetStatusEnum.APPROVED,
        user: user,
        match: match,
        acceptedBy: adminUser
      }

      const savedBet = this.betsRepository.create(betObject);
      const createdBet = await this.betsRepository.save(savedBet);

      // Send email for approval
      // this.mailerService.sendMail({
      //   to: appConfig().SuperAdminEmail,
      //   subject: 'New Bet Approval Required',
      //   text: `A new bet has been created. And waiting for being approved. Details: ${bet.description}, Amount: ${bet.wagerAmount}, Category: ${match.gameType}. Creator username: ${user.username} and email: ${user.email}`,
      // });
      await this.mailerService.sendMail({
        to: appConfig().SuperAdminEmail,
        from: appConfig().fromEmail,
        subject: 'Your bet is created by admin',
        template: 'bet-create', // the file name of the template without extension
        context: {
          description: createAdminBetDto.description,
          wagerAmount: createAdminBetDto.wagerAmount,
          gameType: match.gameType,
          username: user.userName,
          email: user.email,
        },
      });


      // Optionally add the bet to the landing page for users to view and accept


      return ResponseData.success(createdBet);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async createMatch(createMatchDto: CreateMatchDto, adminUser: any): Promise<ResponseHandler> {
    try {
      if (!adminUser.isAdmin) {
        return ResponseData.error(HttpStatus.UNAUTHORIZED, "Unauthorized");
      }
      const matchDate = new Date(createMatchDto.matchDate);
      const currentDate = new Date();
      const timeDifference = (matchDate.getTime() - currentDate.getTime()) / 1000 / 60;

      if (matchDate < currentDate) {
        return ResponseData.error(HttpStatus.BAD_REQUEST, 'Match date cannot be in the past');
      }

      let matchType: MatchTypeEnum;
      if (timeDifference > 30) {
        matchType = MatchTypeEnum.SCHEDULED;
      } else {
        matchType = MatchTypeEnum.LIVE;
      }

      const gameTypeObject = await this.gameTypeRepository.findOne({ where: { name: createMatchDto.gameTypeName } });
      if (!gameTypeObject) {
        return ResponseData.error(HttpStatus.BAD_REQUEST, 'Game type does not exist');
      }
      delete createMatchDto.gameTypeName;

      const match = this.matchRepository.create({ ...createMatchDto, matchType: matchType, gameType: gameTypeObject });
      await this.matchRepository.save(match);
      return ResponseData.success(match);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async updateMatch(id: string, updateMatchDto: UpdateMatchDto): Promise<ResponseHandler> {
    try {
      let matchDate: any;
      let matchType: MatchTypeEnum;
      if (updateMatchDto.matchDate) {
        matchDate = new Date(updateMatchDto.matchDate);
        const currentDate = new Date();
        const timeDifference = (matchDate.getTime() - currentDate.getTime()) / 1000 / 60;


        if (matchDate < currentDate) {
          return ResponseData.error(HttpStatus.BAD_REQUEST, 'Match date cannot be in the past');
        }

        if (timeDifference > 30) {
          matchType = MatchTypeEnum.SCHEDULED;
        } else {
          matchType = MatchTypeEnum.LIVE;
        }
      }
      let gameTypeObject: any;
      if (updateMatchDto.gameTypeName) {
        gameTypeObject = await this.gameTypeRepository.findOne({ where: { name: updateMatchDto.gameTypeName } });
        if (!gameTypeObject) {
          return ResponseData.error(HttpStatus.BAD_REQUEST, 'Game type does not exist');
        }
        delete updateMatchDto.gameTypeName;
        await this.matchRepository.update(id, { ...updateMatchDto, matchType: matchType, gameType: gameTypeObject });

      } else {
        await this.matchRepository.update(id, { ...updateMatchDto, matchType: matchType, });

      }

      const updatedMatch = await this.matchRepository.findOne({ where: { id }, relations: ['gameType'] });
      if (!updatedMatch) {
        return ResponseData.error(
          HttpStatus.NOT_FOUND,
          'Match not found',
        );
      }
      return ResponseData.success(updatedMatch);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async findOneMatch(id: string): Promise<ResponseHandler> {
    try {
      const match = await this.matchRepository.findOne({ where: { id }, relations: ['gameType'] });
      if (!match) {
        return ResponseData.error(
          HttpStatus.NOT_FOUND,
          'Match not found',
        );
      }
      return ResponseData.success(match);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async findAllMatches(): Promise<ResponseHandler> {
    try {
      console.log('Fetching all matches from the database...');
      const matches = await this.matchRepository.createQueryBuilder('match').getMany();

      // const matches = await this.matchRepository.find();
      console.log('Matches retrieved:', matches);

      return ResponseData.success(matches);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }
  async findAllMatchesV2(filterDto: any, adminUser: any): Promise<ResponseHandler> {



    const { matchType, isLocked, gameTypeName, teamA, teamB, page = 1, limit = 10 } = filterDto;
    const query = this.matchRepository.createQueryBuilder('match').leftJoinAndSelect('match.gameType', 'gameType');

    if (!isLocked) {
      query.andWhere('match.isLocked = :isLocked', { isLocked: false });
    }

    if (matchType) {
      query.andWhere('match.matchType = :matchType', { matchType: matchType });
    }

    if (isLocked && adminUser.isAdmin) {
      query.andWhere('match.isLocked = :isLocked', { isLocked: isLocked });
    }

    if (gameTypeName) {
      query.andWhere('gameType.name ILIKE :name', { name: `%${gameTypeName}%` });
    }

    if (teamA) {
      query.andWhere('match.teamA ILIKE :teamA', { teamA: `%${teamA}%` });
    }

    if (teamB) {
      query.andWhere('match.teamB ILIKE :teamB', { teamB: `%${teamB}%` });
    }

    query.skip((page - 1) * limit).take(limit);

    try {
      const [matches, total] = await query.getManyAndCount();
      return ResponseData.success({ matches, total, page, limit });
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async deleteMatch(id: string): Promise<ResponseHandler> {
    try {
      console.log(id)
      const matches = await this.matchRepository.delete(id);
      return ResponseData.success(matches);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }


  ////////////// GAME TYPE //////////////////


  async createGameType(body: CreateGameTypeDto, adminUser: any): Promise<ResponseHandler> {
    try {
      if (!adminUser.isAdmin) {
        return ResponseData.error(HttpStatus.UNAUTHORIZED, "Unauthorized");
      }
      const gameType = this.gameTypeRepository.create(body);
      const savedGameType = await this.gameTypeRepository.save(gameType);
      return ResponseData.success(savedGameType);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async findAllGameType(): Promise<ResponseHandler> {
    try {
      const gameTypes = await this.gameTypeRepository.find({
        order: {
          name: 'ASC',
        },
      }); return ResponseData.success(gameTypes);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async findOneGameType(id: string): Promise<ResponseHandler> {
    try {
      const gameType = await this.gameTypeRepository.findOne({ where: { id: id } });
      if (!gameType) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'Game type not found');
      }
      return ResponseData.success(gameType);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async updateGameType(id: string, body: UpdateGameTypeDto, adminUser): Promise<ResponseHandler> {
    try {
      if (!adminUser.isAdmin) {
        return ResponseData.error(HttpStatus.UNAUTHORIZED, "Unauthorized");
      }
      const updateResult = await this.gameTypeRepository.update(id, body);
      if (updateResult.affected === 0) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'Game type not found');
      }
      const updatedGameType = await this.gameTypeRepository.findOne({ where: { id: id } });
      return ResponseData.success(updatedGameType);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async removeGameType(id: string, adminUser: any): Promise<ResponseHandler> {
    try {
      if (!adminUser.isAdmin) {
        return ResponseData.error(HttpStatus.UNAUTHORIZED, "Unauthorized");
      }
      const deleteResult = await this.gameTypeRepository.delete(id);
      if (deleteResult.affected === 0) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'Game type not found');
      }
      return ResponseData.success({ message: 'Game type deleted successfully' });
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }
}

