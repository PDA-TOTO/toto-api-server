import { Repository } from 'typeorm';
import { IService } from '../IService';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
import PortfolioItems from '../../dbs/main/entities/PortfolioItemsEntity';
import CODE from '../../dbs/main/entities/codeEntity';
import { IBalanceService } from '../balance/IBalanceService';
import { IStockService } from '../stock/IStockService';
import { IUserService } from '../user/IUserService';
import beta from '../../dbs/main/entities/betaEntity';

export type SetPortfolioItemRequest = {
    amount: number;
    price: number;
    code: CODE;
    portId: number;
};

export type PortfolioItemRequest = {
    krxCode: string;
    amount: number;
    price: number;
};

export type PortfolioDetailResponse = {
    id: number;
    totalPrice: number;
    portName: string;
    isMain: boolean;
    portfolioItems: {
        ratio: number;
        amount: number;
        avg: number;
        stockName: string;
        stockCode: string;
    }[];
};

export interface IPortfolioService extends IService {
    portfolioRepository: Repository<PORTFOILIO>;
    portfolioItemRepository: Repository<PortfolioItems>;
    betaRepository : Repository<beta>
    
    balanceService: IBalanceService;
    userService: IUserService;
    stockService: IStockService;
    getBeta(code : string) : Promise<any>;
    findPortById(portId: number, withItem?: boolean): Promise<PORTFOILIO | null>;
    getAllPortfolios(userId: number, withDeleted?: boolean): Promise<PORTFOILIO[]>;
    addPortfolioItem(items: PortfolioItemRequest[], portId: number, userId: number): Promise<void>;
    minusPortfolioItem(items: PortfolioItemRequest[], portId: number, userId: number): Promise<void>;
    getPortfolioByIdAndOwner(portId: number, userId: number, withItem?: boolean): Promise<PORTFOILIO>;
    createPortfolio(
        userId: number,
        portName: string,
        items?: PortfolioItemRequest[],
        isMain?: boolean // 없으면 메인 아님,
    ): Promise<PORTFOILIO>; // items는 종목 코드 있어도 되고 없어도 됨
    deleteById(portId: number, userId: number): Promise<void>;
    getPortfolioWithRatio(portId: number, userId: number): Promise<PortfolioDetailResponse>;
    findPortItemByCodeAndPort(portId: number, code: string): Promise<PortfolioItems | null>;
}
