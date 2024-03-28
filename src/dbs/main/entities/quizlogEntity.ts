import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import Quiz from './quizEntity';

// nullable default is false
@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne( ()=> Quiz,{ cascade: true } )
    @JoinColumn()
    quizid: Quiz;

    @ManyToOne( ()=> User,{ cascade: true } )
    @JoinColumn()
    userid: User;

    @CreateDateColumn({ comment: '풀이 날짜' })
    createdat: Date;
}
