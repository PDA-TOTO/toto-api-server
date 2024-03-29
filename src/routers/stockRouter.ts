import express, { Router, Request, Response, NextFunction } from 'express';
import {} from '../services/stock/stockService';
import axios from 'axios';
import { toDate } from '../utils/date/toDate';
import { authenticate } from '../middlewares/authenticate/authenticate';
import { body } from 'express-validator';
import validateHandler from '../middlewares/validateHandler/validateHandler';
import { IStockService } from '../services/stock/IStockService';
import { StockService } from '../services/stock/StockServiceImpl';
import { AppDataSource } from '../dbs/main/dataSource';

const stockService: IStockService = new StockService(AppDataSource.createQueryRunner());
const router: Router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const stocks = await stockService.showStocks();
    // console.log(stocks);
    res.json(stocks);
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

// router.get('/:code', async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { code } = req.params;
//         const { prev, bundle } = req.query;
//         const result = await getStockInfoWithChart(
//             code,
//             toDate(prev?.toString()),
//             bundle !== 'MONTH' && bundle !== 'YEAR' ? 'DAY' : bundle
//         );

//         res.status(200).json({
//             success: true,
//             message: '주식 차트 가져오기 성공',
//             result: result,
//         });
//     } catch (err) {
//         next(err);
//     }
// });

// // 주식 뉴스 가져오기
// router.get('/:stockId/news', async (req: Request, res: Response, next: NextFunction) => {
//     const url = `https://m.stock.naver.com/api/news/stock/${req.params.stockId}?pageSize=20&page=1`;
//     const response = await axios.get(url);
//     res.send(response.data);
// });

// // 코스피, 코스닥 가져오기
// router.get('/majors', async (req: Request, res: Response, next: NextFunction) => {
//     const url = 'https://m.stock.naver.com/api/index/majors';
//     const response = await axios.get(url);
//     console.log(response.data);
//     res.send(response.data);
// });

// // 매수
// // 유저, 수량, 체결가, 종목코드
// const stockTransactionMiddlewares = [
//     authenticate,
//     body('amount').isNumeric().withMessage('수량은 숫자이어야 합니다.'),
//     body('price').isNumeric().withMessage('가격은 숫자이어야 합니다.'),
//     validateHandler,
// ];
// router.post('/:code/buy', stockTransactionMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { code } = req.params;

//         const { amount, price } = req.body;

//         const result = await buyStock(code, req.user!.email, amount, price);
//         res.status(201).json({
//             success: true,
//             message: '매수 완료',
//             result: result,
//         });
//     } catch (err) {
//         next(err);
//     }
// });

// // 매도
// router.post('/:code/cell', stockTransactionMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { code } = req.params;
//         const { amount, price } = req.body;
//         const result = await cellStock(code, req.user!.email, amount, price);

//         res.status(201).json({
//             success: true,
//             message: '매도 완료',
//             result: result,
//         });
//     } catch (err) {
//         next(err);
//     }
// });

export default router;
