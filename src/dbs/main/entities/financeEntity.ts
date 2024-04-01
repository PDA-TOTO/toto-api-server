import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import CODE from './codeEntity';

@Entity('FINANCE')
export default class Finance {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => CODE, (code: CODE) => code.finances)
    @JoinColumn({ name: 'code' })
    code: CODE;

    @Column({ name: 'yymm', type: 'varchar', length: '10', comment: '날짜', nullable: false })
    yymm: string;

    @Column({ name: 'rev', type: 'bigint', comment: '매출' })
    rev: number;

    @Column({ name: 'income', type: 'bigint', comment: '영업익' })
    income: number;

    @Column({ name: 'net_income', type: 'bigint', comment: '당기순이익' })
    netincome: number;

    @Column({ name: 'roe_val', type: 'float', comment: '자기자본이익률' })
    roeVal: number;

    @Column({ name: 'eps', type: 'float', comment: '주당영업익' })
    eps: number;

    @Column({ name: 'lblt_rate', type: 'float', comment: '부채비율' })
    lbltRate: number;

    @Column({ name: 'bps', type: 'float', comment: '주당 순자산 가치' })
    bps: number;

    @Column({ name: 'cap', type: 'bigint', comment: '시가 총액 (백만)', default: 0 })
    cap: number;

    @Column({ name: 'pbr', type: 'bigint', comment: 'PBR', default: 0 })
    pbr: number;

    @Column({ name: 'dividend', type: 'bigint', comment: '배당금' })
    dividend: number;

    @Column({ name: 'dividend_rate', type: 'float', comment: '배당률' })
    dividendRate: number;

    @Column({ name: 'quick_ratio', type: 'float', comment: '당좌비율', nullable: true })
    quickRatio: number;

    @Column({ name: 'consensus', type: 'bigint', comment: '컨센서스', nullable: true })
    consensus: number;

    // 배당률, 배당금, 당좌비율, consensus, beta
}
