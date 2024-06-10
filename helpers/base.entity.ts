// import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
// import { UserEntity } from './user.entity';
// import { ReviewEntity } from './review.entity';
// import { AbstractEntity } from 'transportation-common';

// @Entity()
// export class AdminReviewEntity extends AbstractEntity {

//     @Column({ name: 'hotel_id' })
//     id: string;

//     @Column({ name: 'hotel_id' })
//     createdAt: string

//     @Column({ name: 'hotel_id' })
//     hotelId: string


//     @Column({ nullable: false, name: 'review_count' })
//     reviewCount: number;

//     @Column({ name: 'hotel_id' })
//     hotelId: string

// }


import { AbstractEntity } from 'transportation-common';
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 