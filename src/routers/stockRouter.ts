import express, { Router, Request, Response, NextFunction } from 'express';
import { getRecentFinance, showStocks } from '../services/stock/stockService';

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const stocks = await showStocks();
    console.log(stocks);
    res.json(stocks);
});

router.get('/:code/finance', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params;
        const result = await getRecentFinance(code);
        res.status(200).json({
            success: true,
            message: '재무재표 가져오기 성공',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
