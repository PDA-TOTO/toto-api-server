import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
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

    @OneToMany(() => PortfolioItems, (portfolioItems) => portfolioItems.portfolio, { cascade: true })
    portfolioItems: PortfolioItems[];

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
