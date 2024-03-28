import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// nullable default is false
@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number;

<<<<<<< Updated upstream
    @Column({ type: 'varchar', length: '30', comment: '회원 이메일', unique: true })
=======
    @OneToOne( (type)=> Account,{ cascade: true} )
    @JoinColumn()
    account: Account;

    @Column({ type: 'int', comment: '경험치', unsigned: true, default: 0 })
    experience: number;

    @Column({ type: 'varchar', length: '30', comment: '이메일', unique: true })
>>>>>>> Stashed changes
    email: string;

    @Column({ type: 'varchar', length: '100', comment: '비밀번호' })
    password: string;

    @Column({ type: 'int', comment: '회원 경험치', unsigned: true, default: 0 })
    exp: number;

    @CreateDateColumn({ comment: '회원가입날짜' })
    createdAt: Date;
}
