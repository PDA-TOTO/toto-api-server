import { Repository } from 'typeorm';
import Quiz from '../../dbs/main/entities/quizEntity';
import { IService } from '../IService';


export interface IQuizService extends IService {
    quizRepository: Repository<Quiz>;

    isExistByEmail(email: string): Promise<boolean>;
}