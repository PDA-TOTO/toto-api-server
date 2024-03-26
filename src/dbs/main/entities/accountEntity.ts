import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// nullable default is false
@Entity()
export default class Account{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: '30', comment: '계좌', unique: true})
    account: string;

    @Column({ type: 'int', comment: '총자산', default: 10000000 })
    amount: number;
}
