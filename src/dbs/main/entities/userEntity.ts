import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// nullable default is false
@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: '30', comment: '회원 이메일', unique: true })
    email: string;

    @Column({ type: 'varchar', length: '100', comment: '회원 ' })
    password: string;

    @Column({ type: 'int', comment: '회원 경험치', unsigned: true, default: 0 })
    exp: number;

    @CreateDateColumn({ comment: '회원가입날짜' })
    createdAt: Date;
}
