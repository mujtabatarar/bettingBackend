import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'transportation-common';
import { ReviewEntity } from './review.entity';

@Entity({ name: 'review_categories' })
@Index(['review_id'])
export class ReviewCategoryEntity
    extends AbstractEntity {
    @Column()
    review_id: string;

    @Column()
    category_id: string;

    @Column({ type: 'float', default: 0 })
    rating: number;

    @ManyToOne(() => ReviewEntity, review => review.review_category)
    @JoinColumn({ name: 'review_id' })
    review: ReviewEntity;
}
