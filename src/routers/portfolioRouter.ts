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

router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const portfolioService2: IPortfolioService = new PortfolioService(AppDataSource.createQueryRunner());
        const result = await portfolioService2.getPortfolioWithRatio(Number(req.params.id), req.user!.id);

        return res.status(200).send({
            succes: true,
            message: '포트폴리오 가져오기',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const portfolioService2: IPortfolioService = new PortfolioService(AppDataSource.createQueryRunner());
        const result = await portfolioService2.deleteById(Number(req.params.id), req.user!.id);

        return res.status(200).send({
            succes: true,
            message: '포트폴리오 삭제',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await portfolioService.deleteById(Number(req.params.id), req.user!.id);

        return res.status(200).json({
            success: true,
            message: '포트폴리오 삭제',
        });
    } catch (err) {
        next(err);
    }
});

const buyCellMiddlewares = [
    authenticate,
    body('price').isNumeric().withMessage('가격은 숫자이어야 합니다'),
    body('amount').isNumeric().withMessage('수량은 숫자이어야 합니다'),
    validateHandler,
];

router.put('/:id/sell', buyCellMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { krxCode, price, amount } = req.body;

        await portfolioService.minusPortfolioItem(
            [
                {
                    krxCode: krxCode,
                    price: Number(price),
                    amount: Number(amount),
                },
            ],
            Number(id),
            req.user!.id
        );

        return res.status(200).json({
            success: true,
            message: '주식 팔기(포트폴리오 빼기) 성공',
        });
    } catch (err) {
        next(err);
    }
});

router.post('/:id/buy', buyCellMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { krxCode, price, amount } = req.body;
        await portfolioService.addPortfolioItem(
            [
                {
                    krxCode: krxCode,
                    price: Number(price),
                    amount: Number(amount),
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
router.get('/:id/beta', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const portId = req.params.id
        const ports = await portfolioService.getAllPortfolios(req.user!.id);
        if (!ports) {
            return res.status(400).json({
                status: 'error',
            });
        }

        // Promise 배열을 저장할 배열
        const betaPromisesArray = ports.map(async (elem, idx) => {
            const portItems = elem.portfolioItems;
            const betas = await Promise.all(
                portItems.map(async (item, idx) => {
                    const beta = await portfolioService.getBeta(item.krxCode.krxCode);
                    return beta;
                })
            );
            return betas;
        });

        const betas = await Promise.all(betaPromisesArray);

        console.log(betas);

        return res.status(200).send({
            success: true,
            // result: ports,
            betas: betas, // 각 포트폴리오 항목에 대한 베타값을 포함하는 배열
        });
    } catch (err) {
        next(err);
    }
});

export default router;
