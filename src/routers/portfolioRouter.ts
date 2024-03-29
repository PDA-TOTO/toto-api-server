import express, { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../dbs/main/dataSource';
import { authenticate } from '../middlewares/authenticate/authenticate';
import { PortfolioService } from '../services/portfolio/PortfolioServiceImpl';
import { IPortfolioService } from '../services/portfolio/IPortfolioService';
import { body } from 'express-validator';
import validateHandler from '../middlewares/validateHandler/validateHandler';

const router: Router = express.Router();

console.log('---- star portfolio ----');
const portfolioService: IPortfolioService = new PortfolioService(AppDataSource.createQueryRunner());

router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { portName, items } = req.body;

        const result = await portfolioService.createPortfolio(req.user!.id, portName, items);
        return res.status(201).json({
            success: true,
            message: '포트폴리오 생성 성공',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});
router.get('/getAllPorts', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await portfolioService.getAllPortfolios(req.user!.id);
        return res.status(200).json({
            success: true,
            message: '포트폴리오 가져오기 성공',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/deletePort', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const port: PORTFOILIO = await portfolioService.findPortById(req.body.portId);
        // console.log(port);
        // const result = await portfolioService.deletePortfolio(port);
        return res.status(200).json({
            success: true,
            message: '포트폴리오 가져오기 성공',
            // result: result
        });
    } catch (err) {
        next(err);
    }
});

const buyMiddlewares = [
    authenticate,
    body('price').isNumeric().withMessage('가격은 숫자이어야 합니다'),
    body('amount').isNumeric().withMessage('수량은 숫자이어야 합니다'),
    validateHandler,
];

router.post('/:id/buy', buyMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { krxCode, price, amount } = req.body;
        await portfolioService.addPortfolioItem(
            [
                {
                    krxCode: krxCode,
                    price: price,
                    amount: amount,
                },
            ],
            Number(id),
            req.user!.id
        );
        return res.status(200).json({
            success: true,
            message: '주식 사기(포트폴리오 담기) 성공',
        });
    } catch (err) {
        next(err);
    }
});
export default router;
