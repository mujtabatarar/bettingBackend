import { Column, Entity, Index, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { AbstractEntity } from 'transportation-common';
import { ReviewEntity } from 'src/modules/review/entities/review.entity';
import { GuestType } from '../enum/review.enum';
import { ReviewHelpfulEntity } from './review_helpful.entity';

@Entity({ name: 'review_user' })
export class UserEntity extends AbstractEntity {

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    userName: string;

    @Column({ nullable: false })
    userSysId: string;

    @Column({ nullable: true })
    imgUrl: string;

    @Column({ nullable: true })
    countryCode: string;

    @Column({ type: 'timestamp', nullable: true })
    checkIn: Date;

    @Column({ type: 'timestamp', nullable: true })
    checkOut: Date;

    @Column({
        type: 'enum',
        enum: GuestType,
        nullable: true
    })
    guest_type: GuestType;

    @OneToMany(() => ReviewEntity, review => review.user)
    reviews: ReviewEntity[];



}
