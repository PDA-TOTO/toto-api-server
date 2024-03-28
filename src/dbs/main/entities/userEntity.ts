import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Account from './accountEntity';

// nullable default is false
@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @OneToOne( (type)=> Account,{ cascade: true} )
    @JoinColumn()
    account: Account;

    @Column({ type: 'int', comment: '경험치', unsigned: true, default: 0 })
    experience: number;

    @Column({ type: 'varchar', length: '30', comment: '이메일', unique: true })

    email: string;

    @Column({ type: 'varchar', length: '100', comment: '비밀번호' })
    password: string;

    @Column({ type: 'integer', comment: '성향', default: 0 })
    tendency: number;

    @CreateDateColumn({ comment: '회원가입날짜' })
    createdAt: Date;
}
