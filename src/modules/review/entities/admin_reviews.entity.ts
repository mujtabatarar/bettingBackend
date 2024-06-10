import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from './user.entity';
import { ReviewEntity } from './review.entity';
import { AbstractEntity } from 'transportation-common';
import { BaseEntity } from 'helpers/base.entity';

@Entity()
export class AdminReviewEntity extends BaseEntity {

    @Column({ nullable: false })
    reviewCount: number;

    @Column()
    hotelId: string

}