import express, { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../dbs/main/dataSource';
import { showStocks } from '../services/stock/stockService';
import { createPortfolio } from '../services/portfolio/portfolioService';
const router: Router = express.Router();

router.post('/create', async(req:Request, res:Response, next: NextFunction)=>{
    
    // const stocks = await createPortfolio(req.body.data);
    // console.log(req.body.data)
    const data = req.body.data
    const stocks = await createPortfolio(data.user, data.portName, data.items);
    return res.json({data : "hi"})
})

export default router;