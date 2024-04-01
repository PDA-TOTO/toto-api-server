import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import CODE from './codeEntity';

@Entity('Beta')
export default class beta {
    @PrimaryColumn({ name: 'krxCode', type: 'varchar' }) // 문자열 형태로 변경
    krxCode: string;

    @Column({ name: 'beta' ,type : 'double'})
    beta: number;

    @OneToOne(() => CODE)
    @JoinColumn({ name: 'krxCode' }) // JoinColumn을 사용하여 CODE 엔터티와의 관계 표현
    code: CODE;
}