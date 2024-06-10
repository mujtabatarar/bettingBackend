import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { ReviewEntity } from './review.entity';
import { AbstractEntity } from 'transportation-common';

@Entity()
export class ReviewImagesEntity extends AbstractEntity {

    @Column()
    img_url: string;

    @ManyToOne(() => ReviewEntity, review => review.images)
    review: ReviewEntity;

}