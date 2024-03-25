import { AppDataSource } from '../../dbs/main/dataSource';
import dotenv from 'dotenv';
import ApplicationError from '../../utils/error/applicationError';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
dotenv.config();

const portfolioRepository = AppDataSource.getRepository(PORTFOILIO);

type PortFolioItem = {
    stock : String,
    weight : Number,
}

export const createPortfolio = async (portId : Number, items : PortFolioItem[])=>{
    // hashing
    // const portfolio = await portfolioRepository.find();
    if(portId === 0 )
        // for(let i=0;i<items.length;i++)
        //     await portfolioRepository.create({portId})
        console.log("영")
    else{
        const result = portfolioRepository.find({where : { portId : portId}})
        console.log(result)
    }
    // return portfolio
};