import express, { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../dbs/main/dataSource';
import { userFindById } from '../services/user/userService';
import User from '../dbs/main/entities/userEntity';
import PORTFOILIO from '../dbs/main/entities/PortfolioEntity';
import { authenticate } from '../middlewares/authenticate/authenticate';
import validateHandler from '../middlewares/validateHandler/validateHandler';
import { PortfolioService } from '../services/portfolio/PortfolioServiceImpl';
import { IPortfolioService, SetPortfolioItemRequest } from '../services/portfolio/IPortfolioService';
import PortfolioItems from '../dbs/main/entities/PortfolioItemsEntity';

const router: Router = express.Router();

const portfolioService: IPortfolioService = new PortfolioService(AppDataSource.createQueryRunner());

router.post('/create', authenticate, async(req:Request, res:Response, next: NextFunction)=>{
    try{
        await portfolioService.createPortfolio(req.user, req.body.portName).then(async (result:PORTFOILIO)=>{
            const portId = result.id
            req.body.items.map(async (elem : PortfolioItems)=>{
                elem.portfolio = result
                await portfolioService.addPortfolioItem(elem);
            })
        }).then(result=>{
                res.status(200).json({
                success: true,
                message: '포트폴리오 생성 성공',
                result: result
            })
        })
    } catch(err){
        next(err)
    }
})
router.get('/getAllPorts', authenticate, async(req:Request, res:Response, next: NextFunction)=>{
    try {
        const result = await portfolioService.getAllPortfolios(req.user!.id);
        return res.status(200).json({
            success: true,
            message: '포트폴리오 가져오기 성공',
            result: result
        })
    } catch(err) {
        next(err);
    }
})
router.delete('/deletePort', authenticate, async(req:Request, res:Response, next: NextFunction)=>{
    try {
        
        const port : PORTFOILIO= await portfolioService.findportbyId(req.body.portId)
        console.log(port)
        const result = await portfolioService.deletePortfolio(port)
        return res.status(200).json({
            success: true,
            message: '포트폴리오 가져오기 성공',
            // result: result
        })
    } catch(err) {
        next(err);
    }
})
export default router;
