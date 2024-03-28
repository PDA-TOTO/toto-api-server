import { Repository } from 'typeorm';
import { IService } from '../IService';
import CODE from '../../dbs/main/entities/codeEntity';
import { StockTransaction } from '../../dbs/main/entities/stockTransactionEntity';
import { IBalanceService } from '../balance/IBalanceService';
import { IUserService } from '../user/IUserService';

export interface IStockService extends IService {
    stockRepository: Repository<CODE>;
    stockTransactionRepository: Repository<StockTransaction>;
    balanceService: IBalanceService;
    userService: IUserService;

    buyStock(email: string, code: string, amount: number, price: number): Promise<void>;
    cellStock(email: string, code: string, amount: number, price: number): Promise<void>;
}
