import { AbstractEntity } from 'transportation-common';
import { Column, Entity, OneToMany } from 'typeorm';
import { MatchEntity } from './match.entity';

@Entity('game_types')
export class GameTypeEntity extends AbstractEntity {
    @Column({ unique: true })
    name: string;

    @OneToMany(() => MatchEntity, match => match.gameType)
    matches: MatchEntity[];
}