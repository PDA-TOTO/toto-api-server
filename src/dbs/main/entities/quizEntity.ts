import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// nullable default is false
@Entity()
export default class Quiz {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', comment: '레벨', unsigned: true, default: 0 })
    level: number;

    @Column({ type: 'longtext', comment: '질문' })
    question: string;

    @Column({ type: 'integer', comment: '답' })
    answer: number;

    @Column({ type: 'longtext', comment: '선택지1' })
    option1: Date;

    @Column({ type: 'longtext', comment: '선택지2' })
    option2: Date;

    @Column({ type: 'longtext', comment: '선택지3' })
    option3: Date;

    @Column({ type: 'longtext', comment: '선택지4' })
    option4: Date;
}
