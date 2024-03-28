import express, { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../dbs/main/dataSource';
import { userFindById } from '../services/user/userService';
import User from '../dbs/main/entities/userEntity';
import PORTFOILIO from '../dbs/main/entities/PortfolioEntity';
import { authenticate } from '../middlewares/authenticate/authenticate';
import validateHandler from '../middlewares/validateHandler/validateHandler';
const router: Router = express.Router();

// router.post('/create', async(req:Request, res:Response, next: NextFunction)=>{

router.get('/portNames', authenticate, async(req:Request, res:Response, next: NextFunction)=>{
//     // console.log(req)
//     // console.log(req.user)
//     const user : User = req.user
//     const userId = req.user?.id;
//     // console.log(userId)
//     const stocks : PORTFOILIO[] = await getPortNames(user);
//     // console.log(stocks)
//     // return res.json(stocks)
//     return res.json(stocks)
// })
// router.get('/getstocks',authenticate, async(req:Request, res:Response, next: NextFunction)=>{
//     console.log(req.body)
//     return res.json({data : "hi"})
})
export default router;
