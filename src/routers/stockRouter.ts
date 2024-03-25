import express, { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../dbs/main/dataSource';
import { showStocks } from '../services/stock/stockService';

const router: Router = express.Router();

router.get('/', async(req:Request, res:Response, next: NextFunction)=>{
    const stocks = await showStocks();
    console.log(stocks)
    res.json(stocks)
})


export default router;