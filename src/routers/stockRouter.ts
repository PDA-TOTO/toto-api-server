import express, { Router, Request, Response, NextFunction } from 'express';
import { getRecentFinance, getStockInfoWithChart, showStocks } from '../services/stock/stockService';
import axios from 'axios';
import { toDate } from '../utils/date/toDate';
import { query } from 'express-validator';

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

router.get('/:code', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params;
        const { prev, bundle } = req.query;
        const result = await getStockInfoWithChart(
            code,
            toDate(prev?.toString()),
            bundle !== 'MONTH' && bundle !== 'YEAR' ? 'DAY' : bundle
        );

        res.status(200).json({
            success: true,
            message: '주식 차트 가져오기 성공',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

// 주식 뉴스 가져오기
router.get('/:stockId/news', async (req: Request, res: Response, next: NextFunction) => {
    const url = `https://m.stock.naver.com/api/news/stock/${req.params.stockId}?pageSize=20&page=1`;
    const response = await axios.get(url);
    res.send(response.data);
});

// 코스피, 코스닥 가져오기
router.get('/majors', async (req: Request, res: Response, next: NextFunction) => {
    const url = 'https://m.stock.naver.com/api/index/majors';
    const response = await axios.get(url);
    console.log(response.data);
    res.send(response.data);
});

export default router;
