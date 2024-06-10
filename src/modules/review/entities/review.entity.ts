import { Column, Entity, Index, BeforeInsert, BeforeUpdate, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AbstractEntity } from 'transportation-common';
import { ReviewCategoryEntity } from './review_categories.entity';
import { UserEntity } from './user.entity';
import { ReviewHelpfulEntity } from './review_helpful.entity';
import { ReviewImagesEntity } from './review_images.entity';
@Entity({ name: 'reviews' })
@Index(['hotelId'])
@Index(['proComment'])
export class ReviewEntity extends AbstractEntity {

    @Column({ nullable: false })
    hotelId: string;

    @Column({ nullable: false })
    roomId: string;

    @Column({ nullable: false })
    userSysId: string;

    @Column({ nullable: true })
    roomType: string;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    proComment: string;

    @Column({ nullable: true })
    conComment: string;

    @Column({ nullable: true })
    hotelResponse: string;

    @Column({ nullable: false })
    overallRating: number;

    @Column({ nullable: true })
    helpfulCount: number;

    @Column({ nullable: true })
    not_helpful_count: number;

    @Column({ nullable: true, })
    language_id: string;

    @ManyToOne(() => UserEntity, user => user.reviews)
    @JoinColumn({ name: 'user_sys_id' })
    user: UserEntity;

    @OneToMany(() => ReviewCategoryEntity, review_category => review_category.review)
    review_category: ReviewCategoryEntity[];

    @OneToMany(() => ReviewHelpfulEntity, reviewHelpful => reviewHelpful.review)
    helpfulMarks: ReviewHelpfulEntity[];

    @OneToMany(() => ReviewImagesEntity, image => image.review)
    images: ReviewImagesEntity[];

}
