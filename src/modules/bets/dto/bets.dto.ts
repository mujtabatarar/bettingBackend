// src/bets/dto/create-bet.dto.ts
import { IsNotEmpty, IsString, IsDecimal, IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { BetStatusEnum } from '../enum/bet.enum';

export class CreateBetViaWebDto {
    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsDecimal()
    @Min(0)
    wagerAmount: number;

    @IsNotEmpty()
    @IsDecimal()
    @Min(0)
    toWinAmount: number;

    @IsNotEmpty()
    @IsInt()
    createdBy: string; // userId of the creator

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
    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsDecimal()
    amount: number;

    @IsNotEmpty()
    @IsString()
    sportCategory: string;
}
