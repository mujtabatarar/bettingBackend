import { AbstractEntity } from 'transportation-common';
import { Column, Entity, OneToMany } from 'typeorm';
import { BetsEntity } from './bets.entity';

@Entity()
export class MatchEntity extends AbstractEntity {

    @Column({ nullable: false })
    teamA: string;

    @Column({ nullable: false })
    teamB: string;

    // @Column({ type: 'decimal' })
    // oddsTeamA: number;

    // @Column({ type: 'decimal' })
    // oddsTeamB: number;

    @Column({ type: 'decimal', nullable: false })
    spreadTeamA: number;

    @Column({ type: 'decimal', nullable: false })
    spreadTeamB: number;

    @Column({ type: 'timestamp', nullable: false })
    matchDate: Date;

    @Column({ nullable: false })
    gameType: string;

    @Column({ nullable: false, default: false })
    isLocked: boolean;

    @Column({ type: 'enum', enum: ['popular', 'live', 'scheduled',], default: 'scheduled' })
    matchType: 'popular' | 'live' | 'scheduled';

    @OneToMany(() => BetsEntity, bet => bet.match)
    bet: BetsEntity[];
}
