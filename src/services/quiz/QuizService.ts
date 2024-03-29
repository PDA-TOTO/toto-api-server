import { AppDataSource } from '../../dbs/main/dataSource';
import dotenv from 'dotenv';
import Quiz from '../../dbs/main/entities/quizEntity';
import Quizlog from '../../dbs/main/entities/quizlogEntity';
import User from '../../dbs/main/entities/userEntity';
import { VisibleUser } from '../user/userServiceReturnType';
import { In, Not } from 'typeorm';

dotenv.config();

const quizRepository = AppDataSource.getRepository(Quiz);
const quizlogRepository = AppDataSource.getRepository(Quizlog);
const userRepository = AppDataSource.getRepository(User);

// 배열을 섞는 함수
function shuffleArray(array: any[]): any[] {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}


//Get Stock Test Quiz
export const getStockTest = async (level: number, userId: VisibleUser): Promise<Quiz[]> => {

    // 해당 레벨의 모든 퀴즈를 가져옵니다.
    const allQuizzes = await quizRepository.find({
        where: { level }
    });

    // 퀴즈 목록을 섞습니다.
    const shuffledQuizzes = shuffleArray(allQuizzes);

    // 필요한 개수만큼 퀴즈를 선택합니다.
    const selectedQuizzes = shuffledQuizzes.slice(0, 5);

    return selectedQuizzes;
};



//Get Level Test Quiz
export const getLevelTest = async (): Promise<Quiz[]> => {

    const response:Quiz[] = []

    const Q0 = await quizRepository.find({
        where: {
            level : 0
        },
        take: 3
    }) 


    const Q1 = await quizRepository.find({
        where: {
            level : 1
        },
        take: 3
    }) 

    const Q2 = await quizRepository.find({
        where: {
            level : 2
        },
        take: 2
    }) 

    const Q3 = await quizRepository.find({
        where: {
            level : 3
        },
        take: 2
    }) 


    const quiz = response.concat(Q0).concat(Q1).concat(Q2).concat(Q3);

    return quiz;
};


//Get Level Test Quiz
export const updateExperience= async (id: number, experience:number): Promise<number> => {

    const user = await userRepository.findOne({
        where:{
            id: id
        }
    });

    if(user){
        user.experience += experience;

        await userRepository.save(user);

        return user.experience;
    }else{
        return 0;
    }

};


