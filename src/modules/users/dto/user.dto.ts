import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsEmail, IsNumberString } from 'class-validator';

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

export class UpdateUserDto extends PartialType(SignupDto) {

}

export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

// src/auth/dto/reset-password.dto.ts
export class ResetPasswordDto {
    token: string;
    newPassword: string;
}

export class IdDto {
    id: string;
}
