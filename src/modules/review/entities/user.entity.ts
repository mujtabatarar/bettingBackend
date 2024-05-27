import { Column, Entity, Index, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { AbstractEntity } from 'transportation-common';
import { ReviewEntity } from 'src/modules/review/entities/review.entity';
import { GuestType } from '../enum/review.enum';

@Entity({ name: 'review_user' })
export class UserEntity extends AbstractEntity {

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    user_sys_id: string;

    @Column({ nullable: true })
    img_url: string;

    @Column({ nullable: true })
    country_code: string;

    @Column({ type: 'timestamp', nullable: true })
    check_in: Date;

    @Column({ type: 'timestamp', nullable: true })
    check_out: Date;

    @Column({
        type: 'enum',
        enum: GuestType,
        nullable: true
    })
    guest_type: GuestType;

    @OneToMany(() => ReviewEntity, review => review.user)
    reviews: ReviewEntity[];
}
