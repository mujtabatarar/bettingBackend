import { IsNotEmpty, IsNumber, IsString, IsOptional, ValidateNested, IsArray, IsDateString, IsEnum, ArrayNotEmpty, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { GuestType } from '../enum/review.enum';

////////GENERIC DTO'S///////////
export class FindOneDto {
    @IsNotEmpty()
    @IsString()
    id: string;
}


////////REVIEW CATEGORY DTO'S///////////
export class CreateReviewCategoryDto {
    @IsNotEmpty()
    @IsString()
    review_id: string;

    @IsNotEmpty()
    @IsString()
    category_id: string;

    @IsNotEmpty()
    @IsNumber()
    rating: number;
}


////////REVIEW DTO'S ///////////
export class CreateReviewDto {
    @IsNotEmpty()
    @IsString()
    hotel_id: string;

    @IsNotEmpty()
    @IsString()
    room_id: string;

    @IsNotEmpty()
    @IsString()
    user_sys_id: string;

    @IsOptional()
    @IsString()
    room_type: string;

    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    pro_comment: string;

    @IsOptional()
    @IsString()
    con_comment: string;

    @IsOptional()
    @IsString()
    hotel_response: string;

    @IsNotEmpty()
    @IsNumber()
    overall_rating: number;

    @IsOptional()
    @IsNumber()
    helpful_count: number;

    @IsOptional()
    @IsNumber()
    not_helpful_count: number;

    @IsOptional()
    @IsString()
    languag_id: string;
}

export class SearchReviewDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    searchTexts: string[];
}

export class UpdateHelpfulDto {
    @IsNumber()
    @IsNotEmpty()
    reviewId: string;

    @IsString()
    @IsNotEmpty()
    userSysId: string; // Change to the appropriate type if needed

    @IsBoolean()
    @IsNotEmpty()
    isHelpful: boolean;
}

////////USER DTO //////////////


export class CreateUserDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    user_sys_id: string;

    @IsOptional()
    @IsString()
    img_url: string;

    @IsOptional()
    @IsString()
    country_code: string;

    @IsOptional()
    @IsDateString()
    check_in: Date;

    @IsOptional()
    @IsDateString()
    check_out: Date;

    @IsOptional()
    @IsEnum(GuestType)
    guest_type: GuestType;
}


///////////IMAGES DTO'S///////////////
export class ReviewImagesDto {

    @IsOptional()
    @IsString()
    img_url: string;
}

/////////COMPREHENSIVE DTO///////////////
export class CreateCompleteReviewDto {
    @ValidateNested()
    @Type(() => CreateUserDto)
    user: CreateUserDto;

    @ValidateNested()
    @Type(() => CreateReviewDto)
    review: CreateReviewDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateReviewCategoryDto)
    reviewCategories: CreateReviewCategoryDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateReviewCategoryDto)
    images: ReviewImagesDto[];
}