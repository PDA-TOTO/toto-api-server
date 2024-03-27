import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from './userEntity';
import CODE from './codeEntity';

@Entity('STOCK_TRANSACTION')
export class StockTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'price', type: 'int', nullable: false })
    price: number;

    @Column({ name: 'amount', type: 'int', nullable: false })
    amount: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => CODE)
    @JoinColumn({ name: 'code' })
    code: CODE;

    @CreateDateColumn({ comment: '거래일' })
    createdAt: Date;
}
