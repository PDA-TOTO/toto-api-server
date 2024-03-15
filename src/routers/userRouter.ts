import express, { Router, Request, Response, NextFunction } from 'express';
import { emailSignUp, logIn, userIsExistByEmail } from '../services/user/userService';
import { body } from 'express-validator';
import validateHandler from '../middlewares/validateHandler/validateHandler';
import { createToken, verifyToken } from '../utils/user/auth';

const router: Router = express.Router();

const signUpValidator = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('올바른 이메일 형식이 아닙니다')
        .custom(async (email) => {
            if (await userIsExistByEmail(email)) throw new Error('해당 이메일은 이미 사용 중 입니다.');
        }),
    body('password')
        .isLength({ min: 6, max: 30 })
        .withMessage('비밀번호의 길이는 6~30 입니다.')
        .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
        .withMessage('비밀번호는 문자+숫자 조합입니다.'),
    validateHandler,
];

router.post('/sign-up', signUpValidator, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await emailSignUp(email, password);

        res.status(200).json({
            success: true,
            message: '회원가입 완료',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

router.post('/log-in', async(req:Request, res:Response, next: NextFunction)=>{
    try{
        const{email,password} = req.body;
        const user = await logIn(email,password)
    
        const token = createToken(user);
    
        res.cookie("authToken", token, {
          httpOnly: true,
        })
    
        res.status(200).json({
            success: true,
            message: '로그인 완료',
            result: email,
        });  
    } catch (err) {
        next(err);
    }
})



router.post('/log-out', async(req:Request, res:Response, next: NextFunction)=>{
    res.cookie("authToken",{}, {
        httpOnly : true,
        expires: new Date(Date.now()),
    });

    res.status(200).json({
        success: true,
        message: '로그아웃 완료',
    });  
})

export default router;
