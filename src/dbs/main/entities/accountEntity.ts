import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from './userEntity';

// nullable default is false
@Entity()
export default class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: '30', comment: '계좌', unique: true })
    account: string;

    @Column({ type: 'int', comment: '총자산', default: 10000000 })
    amount: number;

    @OneToOne(() => User, (user) => user.account)
    @JoinColumn({ name: 'userId' })
    user: User;
}
