import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import CODE from './codeEntity';
import PORTFOILIO from './PortfolioEntity';


@Entity('INFO')
export default class INFO {    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => CODE)
    @JoinColumn({ name: 'krxCode' })
    krxCode: CODE;
    
    @Column({ comment: '포트이름'})
    INFO : String;
}