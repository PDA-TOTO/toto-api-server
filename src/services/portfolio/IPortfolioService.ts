import { Repository } from 'typeorm';
import { IService } from '../IService';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
import PortfolioItems from '../../dbs/main/entities/PortfolioItemsEntity';
import CODE from '../../dbs/main/entities/codeEntity';
import User from '../../dbs/main/entities/userEntity';
import { IBalanceService } from '../balance/IBalanceService';
import { IStockService } from '../stock/IStockService';
import { VisibleUser } from '../user/userServiceReturnType';

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
    findportbyId(portId : number) : Promise<PORTFOILIO>
    buyStock(portId : number, items : PortfolioItems ) : Promise<PORTFOILIO>;
    getAllPortfolios(userId: number): Promise<PORTFOILIO[]>;
    addPortfolioItem(request: PortfolioItems): Promise<void>;
    minusPortfolioItem(request: SetPortfolioItemRequest): Promise<void>;
    //user타입 넘버 => 수정필요(아직 모름 + 안함)
    createPortfolio(user: undefined | VisibleUser , portName: string, items?: AddStockInfoRequest[]): Promise<PORTFOILIO>; // items는 종목 코드 있어도 되고 없어도 됨
    deletePortfolio(portfolio : PORTFOILIO) : Promise<PORTFOILIO>; 
}
