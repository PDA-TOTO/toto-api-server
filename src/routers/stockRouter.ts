import express, { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { toDate } from '../utils/date/toDate';
import { IStockService } from '../services/stock/IStockService';
import { StockService } from '../services/stock/StockServiceImpl';
import { AppDataSource } from '../dbs/main/dataSource';
import { authenticate } from '../middlewares/authenticate/authenticate';
import { query } from 'express-validator';
import validateHandler from '../middlewares/validateHandler/validateHandler';
import ApplicationError from '../utils/error/applicationError';
import INFO from '../dbs/main/entities/infoEntity';

console.log('---- start stock ----');
const stockService: IStockService = new StockService(AppDataSource.createQueryRunner());
const router: Router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const stocks = await stockService.showStocks();
    // console.log(stocks);
    res.json(stocks);
});

// 코스피, 코스닥 가져오기
router.get('/index/majors', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const url = 'https://m.stock.naver.com/api/index/majors';
        const response = await axios.get(url);
        return res.send(response.data);
    } catch (err) {
        next(new ApplicationError(500, 'API 요청 문제'));
    }
});

router.get('/transactions', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { size, page } = req.query;

        const result = await stockService.findStockTransactionByUserId(req.user!.id, Number(size), Number(page));
        return res.status(200).json({
            success: true,
            message: '거래 내역 불러오기',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

router.get('/search/cap', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { size, page } = req.query;

        const result = await stockService.getStocksOrderByCap(Number(page), Number(size));
        return res.status(200).json({
            success: true,
            message: '시가 총액 순으로 불러오기',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

const searchMiddlewares = [query('name').notEmpty().withMessage('종목명은 무조건 있어야 합니다.'), validateHandler];
// 주식 명칭으로 검색
router.get('/search', searchMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.query;
        if (!name || typeof name !== 'string') throw new Error('Server Internal Error');

        const result = await stockService.searchStock(name);

        res.status(200).json({
            success: true,
            message: '주식 검색 성공',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:code/finance', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params;
        const result = await stockService.getFinanceByCode(code);
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
        const result = await stockService.getInfoWithChart(
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

router.get('/:stockId/news', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const url = `https://m.stock.naver.com/api/news/stock/${req.params.stockId}?pageSize=20&page=1`;
        const response = await axios.get(url);
        return res.send(response.data);
    } catch (err) {
        next(new ApplicationError(500, 'API 요청 문제'));
    }
});

const infoRepo = AppDataSource.getRepository(INFO);
router.get('/:stockId/info', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await infoRepo.find({
            where: { krxCode: req.params.stockId },
        });
        res.status(200).json(response);

        //   const response = await stockService.getStockInfo(req.params.stockId);
        //   return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/:code/recent', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await stockService.getRecentPrice(req.params.code);
        res.status(200).json({
            success: true,
            message: '최근 가격 가지고 오기',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:code/my', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await stockService.getMyStockInfo(req.params.code, req.user!.id);
        return res.status(200).json({
            success: true,
            message: '내 주식 현황',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});
router.get('/:code/price', async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.params.code)
        const price = await stockService.getRecentPrice(req.params.code)
        return res.send(price)
    } catch (err) {
        next(err);
    }
});
// 코스피, 코스닥 가져오기
router.get('/index/majors', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await stockService.getMyStockInfo(req.params.code, req.user!.id);
        return res.status(200).json({
            success: true,
            message: '내 주식 현황',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});
router.get(
    "/:code/desc",
    async (req: Request, res: Response, next: NextFunction) => {
        const { code } = req.params;
        console.log(code);
        const desc = await stockService.getDesc(code);
        res.send(desc);
    }
);
export default router;
