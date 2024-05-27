import { Column, Entity, Index, BeforeInsert, BeforeUpdate, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AbstractEntity } from 'transportation-common';
import { ReviewCategoryEntity } from './review_categories.entity';
import { UserEntity } from './user.entity';


@Entity({ name: 'reviews' })
@Index(['hotel_id'])
@Index(['pro_comment'])
export class ReviewEntity extends AbstractEntity {
    @Column({ nullable: false })
    hotel_id: string;

    @Column({ nullable: false })
    room_id: string;

    @Column({ nullable: false })
    user_sys_id: string;

    @Column({ nullable: true })
    room_type: string;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    pro_comment: string;

    @Column({ nullable: true })
    con_comment: string;

    @Column({ nullable: true })
    hotel_response: string;

    @Column({ nullable: false })
    overall_rating: number;

    @Column({ nullable: true })
    helpful_count: number;

    @Column({ nullable: true })
    not_helpful_count: number;

    @Column({ nullable: true })
    language_id: string;

    @ManyToOne(() => UserEntity, user => user.reviews)
    @JoinColumn({ name: 'user_sys_id' })
    user: UserEntity;

    @OneToMany(() => ReviewCategoryEntity, review_category => review_category.review)
    review_category: ReviewCategoryEntity[];

}
