import express, { Router, Request, Response, NextFunction } from 'express';
import { emailSignUp, getMyInfo, logIn,  updateTendency, userIsExistByEmail } from '../services/user/userService';
import { body } from 'express-validator';
import validateHandler from '../middlewares/validateHandler/validateHandler';
import { createToken, verifyToken } from '../utils/user/auth';
import { VisibleUser } from '../services/user/userServiceReturnType';

const router: Router = express.Router();


declare global{
    namespace Express{
        interface Request{
            user?: VisibleUser
        }
    }
}

export async function authenticate(req: Request, res: Response, next: NextFunction){
    try{
        let token = req.cookies.authToken;
        let headerToken = req.headers.authorization;
        if(!token && headerToken){
          token = headerToken.split(" ")[1];
        }
      
        const user = verifyToken(token);

        req.user = user;
      
        if(!user){
          req.user = undefined
        }
        next()
      }catch{
        req.user = undefined
        next()
      }
  }




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
    
        const tokenMaxAge = 60*60*24*3;
        const token = createToken(user, tokenMaxAge);
    

        res.cookie("authToken", token, {
          httpOnly: true,
          maxAge:tokenMaxAge*1000,
        })
    
        res.status(200).json({
            success: true,
            message: '로그인 완료',
            result: user,
        });  

    } catch (err) {
        if(err instanceof Error){
            res.status(200).json({
                success: false,
                message: err.message,
            });
        }
    }
})



router.post('/log-out', async(req:Request, res:Response, next: NextFunction)=>{
    res.cookie("authToken","", {
        httpOnly : true,
        expires: new Date(Date.now()),
    });
    

    res.status(200).json({
        success: true,
        message: '로그아웃 완료',
    });  
})

router.post('/tendency', authenticate, async(req:Request, res:Response, next: NextFunction)=>{
  
    if(!req.user){ 
        return res.status(200).json({
            success: false,
            message: "사용자가 없습니다",
        })
    }
    const tendency = await updateTendency(req.user.email,req.body.point);
    res.status(200).json({
        success: true,
        message: tendency
    });  
})

router.get('/my-info',authenticate, async(req:Request, res:Response, next: NextFunction)=>{
  
    if(!req.user){ 
        return res.status(200).json({
            success: false,
            message: "사용자가 없습니다",
        })
    }

    const user = await getMyInfo(req.user.email);

    if(user){
        res.status(200).json({
            success: true,
            message: "사용자 정보 가져오기 완료",
            result: user
        });  
    }else{
        res.status(200).json({
            success: false,
            message: "사용자가 없습니다."
        });  
    }
})
export default router;
