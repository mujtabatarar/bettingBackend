import { HttpStatus, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { DataSource, Repository } from 'typeorm';
import { ReviewCategoryEntity } from './entities/review_categories.entity';
import { CreateCompleteReviewDto, SearchReviewDto, UpdateHelpfulDto } from './dto/review.dto';
import { ResponseData } from 'helpers/ResponseHandler';
import { errorMessage } from 'constants/messages';
import { UserEntity } from './entities/user.entity';
import { ReviewHelpfulEntity } from './entities/review_helpful.entity';
import { ReviewImagesEntity } from './entities/review_images.entity';

@Injectable()
export class ReviewService {
  constructor(

    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,

    @InjectRepository(ReviewCategoryEntity)
    private reviewCategoryRepository: Repository<ReviewCategoryEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(ReviewHelpfulEntity)
    private readonly reviewHelpfulRepository: Repository<ReviewHelpfulEntity>,

    @InjectRepository(ReviewImagesEntity)
    private readonly reviewImagesRepository: Repository<ReviewImagesEntity>,

    private readonly dataSource: DataSource,
  ) { }


  async createCompleteReview(createCompleteReviewDto: CreateCompleteReviewDto): Promise<ResponseData> {
    const queryRunner = this.reviewRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = this.userRepository.create(createCompleteReviewDto.user);
      const savedUser = await queryRunner.manager.save(user);

      const review = this.reviewRepository.create({
        ...createCompleteReviewDto.review,
        user: savedUser,
      });
      const savedReview = await queryRunner.manager.save(review);

      let reviewCategories, reviewImages: any;
      if (createCompleteReviewDto.reviewCategories) {
        reviewCategories = createCompleteReviewDto.reviewCategories.map(category => {
          return this.reviewCategoryRepository.create({
            ...category,
            review: savedReview,
          });
        });
      }
      const savedReviewCategories = await queryRunner.manager.save(reviewCategories);

      if (createCompleteReviewDto.images) {
        reviewImages = createCompleteReviewDto.images.map(category => {
          return this.reviewCategoryRepository.create({
            ...category,
            review: savedReview,
          });
        });
      }
      const savedImagesCategories = await queryRunner.manager.save(reviewImages);

      await queryRunner.commitTransaction();
      return ResponseData.success({
        user: savedUser,
        review: savedReview,
        reviewCategories: savedReviewCategories,
        images: savedImagesCategories,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        errorMessage.SOMETHING_WENT_WRONG,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getReviewStatisticsByRoom(roomId: string): Promise<any> {
    try {
      // Validate if the room exists by checking if any reviews exist for this room_id
      const roomReviewsExist = await this.reviewRepository
        .createQueryBuilder('review')
        .where('review.room_id = :roomId', { roomId })
        .getCount();

      if (roomReviewsExist === 0) {
        throw new NotFoundException('No reviews found for the given room ID.');
      }

      const [overallRating, totalReviews, categoriesRatings, lastThreeReviews] = await Promise.all([
        this.reviewRepository
          .createQueryBuilder('review')
          .select('AVG(review.overall_rating)', 'average')
          .where('review.room_id = :roomId', { roomId })
          .getRawOne(),

        this.reviewRepository
          .createQueryBuilder('review')
          .select('COUNT(review.id)', 'count')
          .where('review.room_id = :roomId', { roomId })
          .getRawOne(),

        this.reviewCategoryRepository
          .createQueryBuilder('reviewCategory')
          .select('reviewCategory.category_id')
          .addSelect('SUM(reviewCategory.rating)', 'totalRating')
          .innerJoin('reviewCategory.review', 'review')
          .where('review.room_id = :roomId', { roomId })
          .groupBy('reviewCategory.category_id')
          .getRawMany(),

        this.reviewRepository
          .createQueryBuilder('review')
          .where('review.room_id = :roomId', { roomId })
          .andWhere('review.pro_comment IS NOT NULL')
          .orderBy('review.createdAt', 'DESC')
          .limit(3)
          .getMany(),
      ]);

      return ResponseData.success({
        overallRating: parseFloat(overallRating.average),
        totalReviews: parseInt(totalReviews.count, 10),
        categoriesRatings,
        lastThreeReviews,
      });
    }
    catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        errorMessage.SOMETHING_WENT_WRONG,
      );
    }
  }

  async getReviewStatisticsByRoom2(roomId: string): Promise<any> {
    const reviewData = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.review_category', 'reviewCategory')
      .where('review.room_id = :roomId', { roomId })
      .getMany();

    if (reviewData.length === 0) {
      throw new NotFoundException('No reviews found for the given room ID.');
    }

    const totalReviews = reviewData.length;
    const overallRating = reviewData.reduce((sum, review) => sum + review.overallRating, 0) / totalReviews;

    const categoriesRatings = reviewData
      .flatMap(review => review.review_category)
      .reduce((acc, reviewCategory) => {
        if (!acc[reviewCategory.categoryId]) {
          acc[reviewCategory.categoryId] = 0;
        }
        acc[reviewCategory.categoryId] += reviewCategory.rating;
        return acc;
      }, {});

    const lastThreeReviews = reviewData
      .filter(review => review.proComment)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);

    return {
      overallRating,
      totalReviews,
      categoriesRatings,
      lastThreeReviews,
    };
  }

  async getReviewStatisticsByRoom3(roomId: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reviewData = await queryRunner.manager
        .createQueryBuilder(ReviewEntity, 'review')
        .leftJoinAndSelect('review.review_category', 'reviewCategory')
        .where('review.room_id = :roomId', { roomId })
        .getMany();

      if (reviewData.length === 0) {
        throw new NotFoundException('No reviews found for the given room ID.');
      }

      const totalReviews = reviewData.length;
      const overallRating = reviewData.reduce((sum, review) => sum + review.overallRating, 0) / totalReviews;

      const categoriesRatings = reviewData
        .flatMap(review => review.review_category)
        .reduce((acc, reviewCategory) => {
          if (!acc[reviewCategory.categoryId]) {
            acc[reviewCategory.categoryId] = 0;
          }
          acc[reviewCategory.categoryId] += reviewCategory.rating;
          return acc;
        }, {});

      const lastThreeReviews = reviewData
        .filter(review => review.proComment)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3);

      await queryRunner.commitTransaction();

      return {
        overallRating,
        totalReviews,
        categoriesRatings,
        lastThreeReviews,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getReviewStatisticsByRoom4(roomId: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reviewData = await queryRunner.manager
        .createQueryBuilder(ReviewEntity, 'review')
        .leftJoinAndSelect('review.review_category', 'reviewCategory')
        .where('review.room_id = :roomId', { roomId })
        .getMany();

      if (reviewData.length === 0) {
        throw new NotFoundException('No reviews found for the given room ID.');
      }

      const totalReviews = reviewData.length;
      const overallRating = reviewData.reduce((sum, review) => sum + review.overallRating, 0) / totalReviews;

      const categoriesRatings = reviewData
        .flatMap(review => review.review_category)
        .reduce((acc, reviewCategory) => {
          if (!acc[reviewCategory.categoryId]) {
            acc[reviewCategory.categoryId] = 0;
          }
          acc[reviewCategory.categoryId] += reviewCategory.rating;
          return acc;
        }, {});

      const lastThreeReviews = reviewData
        .filter(review => review.proComment)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3);

      await queryRunner.commitTransaction();

      return {
        overallRating,
        totalReviews,
        categoriesRatings,
        lastThreeReviews,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getReviewStatisticsByRoom5(roomId: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reviewData = await queryRunner.manager
        .createQueryBuilder(ReviewEntity, 'review')
        .leftJoinAndSelect('review.review_category', 'reviewCategory')
        .leftJoinAndSelect('review.user', 'user')
        .where('review.room_id = :roomId', { roomId })
        .getMany();

      if (reviewData.length === 0) {
        throw new NotFoundException('No reviews found for the given room ID.');
      }

      const totalReviews = reviewData.length;
      const overallRating = reviewData.reduce((sum, review) => sum + review.overallRating, 0) / totalReviews;

      const categoriesRatings = reviewData
        .flatMap(review => review.review_category)
        .reduce((acc, reviewCategory) => {
          if (!acc[reviewCategory.categoryId]) {
            acc[reviewCategory.categoryId] = 0;
          }
          acc[reviewCategory.categoryId] += reviewCategory.rating;
          return acc;
        }, {});

      const lastThreeReviews = reviewData
        .filter(review => review.proComment)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3)
        .map(review => ({
          name: review.user.name,
          country_code: review.user.countryCode,
          img_url: review.user.imgUrl,
          overall_rating: review.overallRating,
          pro_comment: review.proComment,
          con_comment: review.conComment,
          dateOfReview: review.createdAt,
        }));

      await queryRunner.commitTransaction();

      return {
        overallRating,
        totalReviews,
        categoriesRatings,
        lastThreeReviews,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getReviewStatisticsByRoom6(roomId: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reviewData = await queryRunner.manager
        .createQueryBuilder(ReviewEntity, 'review')
        .leftJoinAndSelect('review.review_category', 'reviewCategory')
        .leftJoinAndSelect('review.user', 'user')
        .where('review.room_id = :roomId', { roomId })
        .getMany();

      if (reviewData.length === 0) {
        throw new NotFoundException('No reviews found for the given room ID.');
      }

      const totalReviews = reviewData.length;
      const overallRating = reviewData.reduce((sum, review) => sum + review.overallRating, 0) / totalReviews;

      const categoriesRatings = reviewData
        .flatMap(review => review.review_category)
        .reduce((acc, reviewCategory) => {
          if (!acc[reviewCategory.categoryId]) {
            acc[reviewCategory.categoryId] = { sum: 0, count: 0 };
          }
          acc[reviewCategory.categoryId].sum += reviewCategory.rating;
          acc[reviewCategory.categoryId].count += 1;
          return acc;
        }, {});

      const averageCategoriesRatings = Object.keys(categoriesRatings).reduce((acc, categoryId) => {
        acc[categoryId] = categoriesRatings[categoryId].sum / categoriesRatings[categoryId].count;
        return acc;
      }, {});

      const lastThreeReviews = reviewData
        .filter(review => review.proComment)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3)
        .map(review => ({
          name: review.user.name,
          country_code: review.user.countryCode,
          img_url: review.user.imgUrl,
          overall_rating: review.overallRating,
          pro_comment: review.proComment,
          con_comment: review.conComment,
          dateOfReview: review.createdAt,
        }));

      await queryRunner.commitTransaction();

      return {
        overallRating,
        totalReviews,
        categoriesRatings: averageCategoriesRatings,
        lastThreeReviews,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateHelpfulCount(updateReviewDto: any): Promise<ResponseData> {
    try {
      const { reviewId, action } = updateReviewDto;

      const review = await this.reviewRepository.findOne(reviewId);
      if (!review) {
        throw new NotFoundException('Review not found');
      }

      if (action === 'helpful') {
        review.helpfulCount += 1;
      } else if (action === 'not_helpful') {
        review.not_helpful_count -= 1;

      } else {
        throw new Error('Invalid action');
      }

      await this.reviewRepository.save(review);

      return ResponseData.success(review);
    } catch (error) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        errorMessage.SOMETHING_WENT_WRONG,
      );
    }
  }

  async searchProComments(searchReviewDto: SearchReviewDto): Promise<ResponseData> {
    try {
      const { searchTexts } = searchReviewDto;

      let query = this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.user', 'user');

      searchTexts.forEach((text, index) => {
        query = query.andWhere(`review.pro_comment LIKE :searchText${index}`, {
          [`searchText${index}`]: `%${text}%`,
        });
      });
      const reviews = await query.getMany();
      return ResponseData.success(reviews);
    } catch (error) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        errorMessage.SOMETHING_WENT_WRONG,
      );
    }
  }

  async updateHelpfulCountNew(updateHelpfulDto: UpdateHelpfulDto): Promise<ResponseData> {
    try {
      const { reviewId, userSysId, isHelpful } = updateHelpfulDto;

      const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
      if (!review) {
        throw new NotFoundException('Review not found');
      }

      const existingMark = await this.reviewHelpfulRepository.findOne({ where: { review, userSysId: userSysId } });

      if (existingMark) {
        throw new ConflictException('You have already marked this review');
      }

      if (isHelpful) {
        review.helpfulCount = (review.helpfulCount || 0) + 1;
      } else {
        review.not_helpful_count = (review.not_helpful_count || 0) + 1;
      }

      const reviewHelpful = this.reviewHelpfulRepository.create({ review, userSysId, isHelpful });
      await this.reviewHelpfulRepository.save(reviewHelpful);
      await this.reviewRepository.save(review);

      return ResponseData.success({
        message: `Marked as ${isHelpful ? 'helpful' : 'not helpful'}`,
        review,
      });
    } catch (err) {
      return ResponseData.error(
        HttpStatus.BAD_REQUEST,
        errorMessage.SOMETHING_WENT_WRONG,
      );
    }
  }
}