import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import CODE from './codeEntity';
import Account from './accountEntity';

@Entity('STOCK_BALANCE')
export class StockBalance {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => CODE)
    @JoinColumn({ name: 'code' })
    code: CODE;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'accountId' })
    account: Account;

    @Column({ name: 'amount', type: 'bigint', comment: '수량', unsigned: true })
    amount: number;

    @Column({ name: 'avg', type: 'bigint', comment: '매수 평균가', unsigned: true })
    avg: number;
}
