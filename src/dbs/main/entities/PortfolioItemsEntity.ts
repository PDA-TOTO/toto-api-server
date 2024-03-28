import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import CODE from './codeEntity';
import PORTFOILIO from './PortfolioEntity';

// nullable default is false
@Entity('PORTFOLIO_ITEMS')
export default class PortfolioItems {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => CODE)
    @JoinColumn({ name: 'krxCode' })
    krxCode: CODE;

    @ManyToOne(() => PORTFOILIO)
    @JoinColumn({ name: 'portId' })
    portfolio: PORTFOILIO;

    @Column({ name: 'amount', type: 'bigint', comment: '수량', unsigned: true })
    amount: number;

    @Column({ name: 'avg', type: 'float', comment: '매수 평균가', unsigned: true })
    avg: number;
}
