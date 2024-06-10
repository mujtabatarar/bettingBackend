import { IsNotEmpty, IsString, IsOptional, IsEmail, IsNumberString } from 'class-validator';

export class SignupDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsEmail()
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
    @IsEmail()
    password: string;
}

export class UpdateUserDto extends SignupDto {

}

export class ForgotPasswordDto {
    email: string;
}

// src/auth/dto/reset-password.dto.ts
export class ResetPasswordDto {
    token: string;
    newPassword: string;
}
