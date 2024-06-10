import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AbstractEntity } from 'transportation-common';
import { WagesEntity } from 'src/modules/bets/entities/wages.entity';

@Entity()
export class UserEntity extends AbstractEntity {

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true, nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    refferalCode: string;

    @Column({ default: false })
    isThisUserAdmin: boolean;

    @Column({ nullable: true })
    resetPasswordToken: string;

    @Column({ type: 'timestamp', nullable: true })
    resetPasswordExpires: Date;

    @OneToMany(() => WagesEntity, wage => wage.createdBy)
    createdWages: WagesEntity[];

    @OneToMany(() => WagesEntity, wage => wage.acceptedBy)
    acceptedWages: WagesEntity[];

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}
