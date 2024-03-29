import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('INFO')
export default class INFO {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'krxCode',
        type: 'varchar',
        length: '30',
        comment: '종목 코드',
        nullable: false,
    })
    krxCode: string;

    @Column({
        name: 'INFO',
        type: 'varchar',
        length: '100',
        comment: '종목 개요',
        nullable: false,
    })
    INFO: string;
}
