import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import CODE from './codeEntity';
import PortfolioItems from './PortfolioItemsEntity';
import User from './userEntity';

// nullable default is false
@Entity('PORTFOLIO')
export default class PORTFOILIO {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ comment: '포트이름' })
    portName: string;

    @Column({ name: 'is_main', type: 'boolean', default: false })
    isMain: boolean;

    @OneToMany(() => PortfolioItems, (portfolioItems) => portfolioItems.portfolio)
    portfolioItems: PortfolioItems[];
}
