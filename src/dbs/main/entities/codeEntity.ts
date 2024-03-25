import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("CODE")
export default class CODE{
    @PrimaryGeneratedColumn()
    id : number;

    @Column({type : 'varchar', length : '30', comment :'거래소 코드'})
    krxCode : string;

    @Column({type : 'varchar', length : '30', comment :'종목명'})
    name : string;

    @Column({type : 'varchar', length : '30', comment :'타입'})
    type : string;
}