// src/bets/dto/create-bet.dto.ts
import { IsNotEmpty, IsString, IsBoolean, IsDecimal, IsDate, IsInt, IsOptional, Min, Max, IsEnum, IsNumber, IsDateString, IsEmail } from 'class-validator';
import { BetStatusEnum, MatchTypeEnum } from '../enum/bet.enum';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateBetViaWebDto {
    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    wagerAmount: number;

    @IsNotEmpty()
    @IsString()
    matchId: string;

    @IsOptional()
    user: any;

}


export class UpdateBetDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDecimal()
    amount?: number;

    @IsOptional()
    @IsString()
    sportCategory?: string;

    @IsOptional()
    @IsEnum(BetStatusEnum)
    status?: BetStatusEnum;
}

export class CreateAdminBetDto {
    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    wagerAmount: number;

    @IsNotEmpty()
    @IsNumber()
    toWinAmount: number;

    @IsNotEmpty()
    @IsEmail()
    userEmail: string;

    @IsNotEmpty()
    @IsString()
    matchId: string;
}

export class CreateMatchDto {
    @IsNotEmpty()
    @IsString()
    teamA: string;

    @IsNotEmpty()
    @IsString()
    teamB: string;

    @IsNotEmpty()
    @IsNumber()
    spreadTeamA: number;

    @IsNotEmpty()
    @IsNumber()
    spreadTeamB: number;

    @IsNotEmpty()
    @IsDateString()
    matchDate: string;

    @IsNotEmpty()
    @IsString()
    gameTypeName: string;

    // @IsNotEmpty()
    // @IsEnum(['popular', 'live', 'scheduled'])
    // matchType: 'popular' | 'live' | 'scheduled';
}


export class UpdateMatchDto extends PartialType(CreateMatchDto) { }

export class IdDto {
    @IsNotEmpty()
    @IsString()
    teamA: string;
}

export class BetsQueryDto {
    @IsOptional()
    @IsEnum(BetStatusEnum)
    status?: BetStatusEnum;

    @IsOptional()
    @IsString()
    createdBy?: string;

    @IsOptional()
    @IsString()
    matchId?: string;


    @IsOptional()
    @IsString()
    description?: string;


    @IsOptional()
    @IsNumber()
    wagerAmount?: number;


    @IsOptional()
    @IsNumber()
    toWinAmount?: number;

    @IsOptional()
    @IsString()
    acceptedBy?: string;

}

export class UpdateBetStatusAndToWinAmountDto {
    @IsNotEmpty()
    @IsEnum(BetStatusEnum)
    status: BetStatusEnum;

    @IsNotEmpty()
    @IsNumber()
    toWinAmount: number;
}

export class CreateGameTypeDto {
    @IsString()
    name: string;
}
export class UpdateGameTypeDto {
    @IsString()
    name: string;
}

export class MatchFilterDto {
    @IsOptional()
    @IsEnum(MatchTypeEnum)
    matchType?: MatchTypeEnum;

    @IsOptional()
    @IsBoolean()
    isLocked?: boolean;

    @IsOptional()
    @IsString()
    gameType?: string;

    @IsOptional()
    @IsString()
    teamA?: string;

    @IsOptional()
    @IsString()
    teamB?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}