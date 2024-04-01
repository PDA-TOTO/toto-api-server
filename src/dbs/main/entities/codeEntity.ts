import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import Finance from './financeEntity';
import Price from './priceEntity';

export enum CodeType {
    STOCK = 'STOCK',
    ETF = 'ETF',
}

@Entity('CODE')
export default class CODE {
    @PrimaryColumn({ name: 'krxCode', type: 'varchar', length: '30', comment: '거래소 코드' })
    krxCode: string;

    @Column({ name: 'name', type: 'varchar', length: '30', comment: '종목명', unique: true, nullable: false })
    name: string;

    // STOCK, ETF
    @Column({ name: 'type', type: 'enum', comment: '타입', nullable: false, enum: CodeType, default: CodeType.STOCK })
    type: CodeType;

    @OneToMany(() => Finance, (finance) => finance.code)
    finances: Finance[];

    @OneToMany(() => Price, (price) => price.code)
    prices: Price[];
}
