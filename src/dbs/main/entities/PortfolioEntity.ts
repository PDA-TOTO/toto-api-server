import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import CODE from './codeEntity';
import PortfolioItems from './PortfolioItemsEntity';
import User from './userEntity';

// nullable default is false
@Entity("PORTFOLIO")
export default class PORTFOILIO {

    @PrimaryGeneratedColumn()
    id: Number;

    @ManyToOne(() => User)
    @JoinColumn({name:'userId'})
    user : User;

    @Column({ comment: '포트이름'})
    portName : String;
}