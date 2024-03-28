import { Repository } from 'typeorm';
import { IService } from '../IService';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
import PortfolioItems from '../../dbs/main/entities/PortfolioItemsEntity';
import CODE from '../../dbs/main/entities/codeEntity';
import User from '../../dbs/main/entities/userEntity';
import { IBalanceService } from '../balance/IBalanceService';
import { IStockService } from '../stock/IStockService';

export type SetPortfolioItemRequest = {
    amount: number;
    price: number;
    code: CODE;
    portId: number;
};

export type AddStockInfoRequest = {
    id: string;
    amount: number;
    price: number;
};

export interface IPortfolioService extends IService {
    portfolioRepository: Repository<PORTFOILIO>;
    portfolioItemRepository: Repository<PortfolioItems>;
    balanceService: IBalanceService;
    stockService: IStockService;

    getAllPortfolios(userId: number): Promise<PORTFOILIO[]>;
    addPortfolioItem(request: SetPortfolioItemRequest): Promise<void>;
    minusPortfolioItem(request: SetPortfolioItemRequest): Promise<void>;
    createPortfolio(user: User, portName: string, items?: AddStockInfoRequest[]): Promise<void>; // items는 종목 코드 있어도 되고 없어도 됨
}
