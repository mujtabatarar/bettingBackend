import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'transportation-common';
import { ReviewEntity } from './review.entity';
import { BaseEntity } from 'helpers/base.entity';

@Entity({ name: 'review_categories' })
@Index(['reviewId'])
export class ReviewCategoryEntity

    extends BaseEntity {
    @Column()
    reviewId: string;

    @Column()
    categoryId: string;

    @Column({ type: 'float', default: 0 })
    rating: number;

    @ManyToOne(() => ReviewEntity, review => review.review_category)
    @JoinColumn({ name: 'reviewId' })
    review: ReviewEntity;
}
