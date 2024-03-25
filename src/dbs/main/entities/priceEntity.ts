import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import CODE from './codeEntity';

@Entity('PRICE')
export default class Price {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => CODE, (code) => code.prices)
    @JoinColumn({ name: 'code' })
    code: CODE;

    @Column({ name: 'date', type: 'timestamp', nullable: false })
    date: Date;

    @Column({ name: 'sPr', type: 'bigint', nullable: false, comment: '시가' })
    sPr: number;

    @Column({ name: 'hPr', type: 'bigint', nullable: false, comment: '고가' })
    hPr: number;

    @Column({ name: 'iPr', type: 'bigint', nullable: false, comment: '저가' })
    iPr: number;

    @Column({ name: 'ePr', type: 'bigint', nullable: false, comment: '종가' })
    ePr: number;
}
