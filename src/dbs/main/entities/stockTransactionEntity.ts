import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import CODE from './codeEntity';
import PORTFOILIO from './PortfolioEntity';

export enum TransactionType {
    BUY = 'BUY',
    CELL = 'CELL',
}

@Entity('STOCK_TRANSACTION')
export class StockTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'price', type: 'int', nullable: false })
    price: number;

    @Column({ name: 'amount', type: 'int', nullable: false })
    amount: number;

    @Column({ name: 'transaction_type', type: 'enum', enum: TransactionType })
    transactionType: TransactionType;

    @ManyToOne(() => PORTFOILIO)
    @JoinColumn({ name: 'portfolioId' })
    portfolio: PORTFOILIO;

    @ManyToOne(() => CODE)
    @JoinColumn({ name: 'code' })
    code: CODE;

    @CreateDateColumn({ comment: '거래일' })
    createdAt: Date;
}
