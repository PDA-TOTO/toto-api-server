import express, { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../dbs/main/dataSource';
import { showStocks } from '../services/stock/stockService';
import { getPortNames,createPortfolio } from '../services/portfolio/portfolioService';
import { userFindById } from '../services/user/userService';
import User from '../dbs/main/entities/userEntity';
import PORTFOILIO from '../dbs/main/entities/PortfolioEntity';

const router: Router = express.Router();

router.post('/create', async(req:Request, res:Response, next: NextFunction)=>{
    
    // const stocks = await createPortfolio(req.body.data);
    // console.log(req.body.data)
    const data = req.body.data
    const stocks = await createPortfolio(data.user, data.portName, data.items);
    return res.json({data : "hi"})
})

router.get('/portNames', async(req:Request, res:Response, next: NextFunction)=>{
    // console.log(req)
    const userId = req.body.user
    // console.log("userId", userId)
    const User : User | null = await userFindById(userId)
    const stocks : PORTFOILIO[] = await getPortNames(User);
    console.log(stocks)
    return res.json(stocks)
})

export default router;