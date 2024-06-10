import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from './user.entity';
import { ReviewEntity } from './review.entity';
import { AbstractEntity } from 'transportation-common';

@Entity()
export class ReviewHelpfulEntity extends AbstractEntity {

    @Column()
    isHelpful: boolean;

    @Column()
    userSysId: string;

    @ManyToOne(() => ReviewEntity, review => review.helpfulMarks, { eager: true })
    review: ReviewEntity;
}