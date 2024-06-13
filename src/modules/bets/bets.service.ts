import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseData, ResponseHandler } from 'helpers/ResponseHandler';
import { CreateAdminBetDto, CreateBetViaWebDto, UpdateBetDto } from './dto/bets.dto';
import { MailerService } from '@nestjs-modules/mailer';
import appConfig from 'config/appConfig';
import { UserEntity } from '../users/entities/user.entity';
import { BetStatusEnum } from './enum/bet.enum';
import * as cron from 'node-cron';
import { MatchEntity } from './entities/match.entity';
import { BetsEntity } from './entities/bets.entity';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(MatchEntity)
    private matchRepository: Repository<MatchEntity>,

    @InjectRepository(BetsEntity)
    private betsRepository: Repository<BetsEntity>,

    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,

    private mailerService: MailerService

  ) { }

  async createBet(createBetDto: CreateBetViaWebDto): Promise<ResponseHandler> {
    try {

      const user = await this.usersRepository.findOne({ where: { id: createBetDto.createdBy } });
      if (!user) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'User not found');
      }

      const match = await this.matchRepository.findOne({ where: { id: createBetDto.matchId, isLocked: false } })
      if (!match) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'Match not found, or is allready locked.');
      }
      const bet = this.betsRepository.create({ ...createBetDto, status: BetStatusEnum.PENDING_APPROVAL, user: user });
      const createdBet = await this.betsRepository.save(bet);

      // Send email for approval
      await this.mailerService.sendMail({
        to: appConfig().SuperAdminEmail,
        subject: 'New Bet Approval Required',
        text: `A new bet has been created. And waiting for being approved. Details: ${bet.description}, Amount: ${bet.wagerAmount}, Category: ${match.gameType}. Creator username: ${user.username} and email: ${user.email}`,
      });
      return ResponseData.success(createdBet);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async acceptBet(betId: string, user: any): Promise<ResponseHandler> {
    try {
      const bet = await this.betsRepository.findOne({ where: { id: betId } });
      if (!bet) {
        return ResponseData.error(HttpStatus.NOT_FOUND, 'Bet not found');
      }

      if (bet.status !== BetStatusEnum.PENDING_APPROVAL) {
        return ResponseData.error(HttpStatus.BAD_REQUEST, 'Bet cannot be accepted');
      }

      bet.status = BetStatusEnum.APPROVED;
      bet.acceptedBy = user.id;
      const updatedBet = await this.betsRepository.save(bet);

      // Optionally send confirmation emails to involved users
      const betOwner = await this.usersRepository.findOne({ where: { id: bet.createdBy } });

      await this.mailerService.sendMail({
        to: betOwner.email,
        subject: 'Bet approved.',
        text: `Hey mr ${betOwner.name} your bet is approved`,
      });

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

  async findAllBets(): Promise<ResponseHandler> {
    try {
      const bets = await this.betsRepository.find();
      return ResponseData.success(bets);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

  async findAllMatches(): Promise<ResponseHandler> {
    try {
      const matches = await this.matchRepository.find();
      return ResponseData.success(matches);
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



  async createAdminBet(createAdminBetDto: CreateAdminBetDto): Promise<ResponseHandler> {
    try {
      const bet = this.betsRepository.create({ ...createAdminBetDto, status: BetStatusEnum.BY_ADMIN });
      const createdBet = await this.betsRepository.save(bet);

      // Optionally add the bet to the landing page for users to view and accept

      return ResponseData.success(createdBet);
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        err?.message || 'Something went wrong',
      );
    }
  }

}

