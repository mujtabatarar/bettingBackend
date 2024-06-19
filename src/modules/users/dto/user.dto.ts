import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsEmail, IsNumberString, IsBoolean, IsInt, Min } from 'class-validator';

export class SignupDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsNumberString()
    phoneNumber: string;

    @IsOptional()
    @IsString()
    refferalCode: string;
}

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    userName: string;

    @IsOptional()
    @IsNumberString()
    phoneNumber: string;

}


export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

// src/auth/dto/reset-password.dto.ts
export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    token: string;

    @IsNotEmpty()
    @IsString()
    newPassword: string;
}

export class IdDto {
    id: string;
}

export class UserFilterDto {
    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    userName?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsBoolean()
    isAdmin?: boolean;



    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number;
}
