import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import CODE from './codeEntity';
import PORTFOILIO from './PortfolioEntity';
import User from './userEntity';

// nullable default is false
@Entity("PORTFOLIO_ITEMS")
export default class PortfolioItems {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=>CODE)
    @JoinColumn({name: 'krxCode'})
    krxCode: CODE

    @ManyToOne(() => PORTFOILIO)
    @JoinColumn({ name: 'portId' })
    portId: PORTFOILIO;

    @Column({ type: 'float', comment: '비중'})
    weight: number;
}