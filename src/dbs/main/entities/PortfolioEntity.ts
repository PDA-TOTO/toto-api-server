import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// nullable default is false
@Entity("PORTFOLIO")
export default class PORTFOILIO {
    @PrimaryGeneratedColumn()
    id: Number;

    @Column({ type: 'varchar', length: '30', comment: '회원 이메일', unique: true })
    portId: Number;

    @Column({ type: 'float', comment: '비중', unique: true })
    stock: String;

    @CreateDateColumn({ comment: '회원가입날짜' })
    weight: Date;
}
