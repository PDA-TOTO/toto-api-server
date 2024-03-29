import express, { Router, Request, Response, NextFunction } from 'express';
import { IQuizService } from '../services/quiz/IQuizService';
import { authenticate } from '../middlewares/authenticate/authenticate';
import { getLevelTest, getStockTest, updateExperience } from '../services/quiz/QuizService';

const router: Router = express.Router();

router.get('/test',authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const level = (req.user!.experience < 100 ? 0
            : (req.user!.experience < 400 ? 1
            : (req.user!.experience< 800 ? 2
            : 3)))
        
        if(req.user){
            const quiz = await getStockTest(level, req.user);
            
    
            res.status(200).json({
                success: true,
                message: '레벨테스트 문제 가져오기 완료',
                result: quiz
            })
        }else{
            res.status(200).json({
                success: true,
                message: '유저가 없습니다.',
                result: null
            })
        }

    } catch (err) {
        next(err);
    }
});


router.get('/level',authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const quiz = await getLevelTest()

        res.status(200).json({
            success: true,
            message: '레벨테스트 문제 가져오기 완료',
            result: quiz
        })
        
    } catch (err) {
        next(err);
    }
});

router.post('/experience', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const experience = await updateExperience(req.user!.id,req.body?.experience)

        res.status(200).json({
            success: true,
            message: '경험치 추가 완료',
            result: experience
        })
        
    } catch (err) {
        next(err);
    }
});


export default router;
