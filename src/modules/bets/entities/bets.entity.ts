// src/bets/entities/bet.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from 'transportation-common';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { MatchEntity } from './match.entity';

@Entity('bets')
export class BetsEntity extends AbstractEntity {

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'decimal' })
    wagerAmount: number;

    @Column({ type: 'decimal', nullable: true, default: null })
    toWinAmount: number;

    @Column({ type: 'enum', enum: ['approved', 'pending-approval', 'rejected', 'by_admin'], default: 'pending' })
    status: string;

    @Column()
    createdBy: string;

    @Column()
    matchId: string;

    @ManyToOne(() => UserEntity, user => user.createdWages)
    @JoinColumn({ name: 'createdBy' })
    user: UserEntity;

    @ManyToOne(() => MatchEntity, match => match.bet)
    @JoinColumn({ name: 'matchId' })
    match: MatchEntity;

    // Relationship to the User who accepted the wage (should be an admin)
    @ManyToOne(() => UserEntity, user => user.acceptedWages)
    @JoinColumn({ name: 'acceptedBy' })
    acceptedBy: UserEntity;


}
