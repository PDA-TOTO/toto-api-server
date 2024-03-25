import express, { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../dbs/main/dataSource';
import { showStocks } from '../services/stock/stockService';
import { createPortfolio } from '../services/portfolio/portfolioService';
const router: Router = express.Router();

router.post('/', async(req:Request, res:Response, next: NextFunction)=>{
    
    // const stocks = await createPortfolio(req.body);
    console.log(res)
    res.json(res)
})

export default router;