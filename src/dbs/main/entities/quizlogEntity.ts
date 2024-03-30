import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import Quiz from './quizEntity';
import User from './userEntity';

// nullable default is false
@Entity()
export default class Quizlog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne( ()=> Quiz,{ cascade: true } )
    @JoinColumn()
    quizid: Quiz;

    @ManyToOne( ()=> User,{ cascade: true } )
    @JoinColumn()
    userid: User;

}
