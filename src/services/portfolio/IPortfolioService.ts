import { Repository } from 'typeorm';
import { IService } from '../IService';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
import PortfolioItems from '../../dbs/main/entities/PortfolioItemsEntity';
import CODE from '../../dbs/main/entities/codeEntity';
import { IBalanceService } from '../balance/IBalanceService';
import { IStockService } from '../stock/IStockService';
import { VisibleUser } from '../user/userServiceReturnType';
import { IUserService } from '../user/IUserService';

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

export interface IPortfolioService extends IService {
    portfolioRepository: Repository<PORTFOILIO>;
    portfolioItemRepository: Repository<PortfolioItems>;
    balanceService: IBalanceService;
    userService: IUserService;
    stockService: IStockService;
    findPortById(portId: number): Promise<PORTFOILIO | null>;
    getAllPortfolios(userId: number): Promise<PORTFOILIO[]>;
    addPortfolioItem(items: PortfolioItemRequest[], portId: number, userId: number): Promise<void>;
    minusPortfolioItem(request: SetPortfolioItemRequest): Promise<void>;
    //user타입 넘버 => 수정필요(아직 모름 + 안함)
    createPortfolio(
        userId: number,
        portName: string,
        items?: PortfolioItemRequest[],
        isMain?: boolean // 없으면 메인 아님,
    ): Promise<PORTFOILIO>; // items는 종목 코드 있어도 되고 없어도 됨
    deletePortfolio(portfolio: PORTFOILIO): Promise<PORTFOILIO>;
}
