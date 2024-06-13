import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AbstractEntity } from 'transportation-common';
import { BetsEntity } from 'src/modules/bets/entities/bets.entity';

@Entity()
export class UserEntity extends AbstractEntity {

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column({ unique: true, nullable: true })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true, nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    refferalCode: string;

    @Column({ default: false })
    isAdmin: boolean;

    @Column({ nullable: true })
    resetPasswordToken: string;

    @Column({ type: 'timestamp', nullable: true })
    resetPasswordExpires: Date;

    @OneToMany(() => BetsEntity, bet => bet.createdBy)
    createdBets: BetsEntity[];

    @OneToMany(() => BetsEntity, bet => bet.acceptedBy)
    acceptedBets: BetsEntity[];

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}
