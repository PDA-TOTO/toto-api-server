import express, { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import validateHandler from '../middlewares/validateHandler/validateHandler';
import { createToken } from '../utils/user/auth';
import { authenticate } from '../middlewares/authenticate/authenticate';
import { IUserService } from '../services/user/IUserService';
import { UserService } from '../services/user/UserServiceImpl';
import { AppDataSource } from '../dbs/main/dataSource';
import ApplicationError from '../utils/error/applicationError';
const router: Router = express.Router();
const userService: IUserService = new UserService(AppDataSource.createQueryRunner());

const signUpValidator = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('올바른 이메일 형식이 아닙니다')
        .custom(async (email) => {
            if (await userService.isExistByEmail(email)) throw new Error('해당 이메일은 이미 사용 중 입니다.');
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
        const result = await userService.emailSignUp(email, password);

        return res.status(200).json({
            success: true,
            message: '회원가입 완료',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

router.post('/log-in', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await userService.logIn(email, password);

        const tokenMaxAge = 60 * 60 * 24 * 3;
        const token = createToken(user, tokenMaxAge);

        res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: tokenMaxAge * 1000,
        });

        return res.status(200).json({
            success: true,
            message: '로그인 완료',
            result: user,
        });
    } catch (err) {
        next(err);
    }
});

router.post('/log-out', async (req: Request, res: Response, next: NextFunction) => {
    res.cookie('authToken', '', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });

    return res.status(200).json({
        success: true,
        message: '로그아웃 완료',
    });
});

const updateTendencyMiddlewares = [
    authenticate,
    body('point').isNumeric().withMessage('포인트는 숫자이어야 합니다.'),
    validateHandler,
];
router.post('/tendency', updateTendencyMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tendency = await userService.updateTendency(req.user!.email, req.body.point);
        return res.status(200).json({
            success: true,
            message: tendency,
        });
    } catch (err) {
        next(err);
    }
});

// TODO: 디테일하기 가져오기
router.get('/my-info', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.findByEmail(req.user!.email);

        if (!user) {
            throw new ApplicationError(401, '해당 유저 존재하지 않음');
        }

        return res.status(200).json({
            success: true,
            message: '사용자 정보 가져오기 완료',
            result: {
                id: user.id,
                email: user.email,
                account: user.account,
            },
        });
    } catch (err) {
        next(err);
    }
});
export default router;
