import { Repository } from 'typeorm';
import { IService } from '../IService';
import Account from '../../dbs/main/entities/accountEntity';
import { StockBalance } from '../../dbs/main/entities/stockBalanceEntity';
import User from '../../dbs/main/entities/userEntity';
import { IStockService } from '../stock/IStockService';

export type AccountResponse = {
    id: number;
    amount: number;
    account: string;
};

export interface IBalanceService extends IService {
    accountRepository: Repository<Account>;
    stockBalanceRepository: Repository<StockBalance>;
    stockService: IStockService;

    createAccount(user: User): Promise<AccountResponse>;
    buyStock(userId: number, code: string, price: number, amount: number): Promise<void>;
    cellStock(userId: number, code: string, price: number, amount: number): Promise<void>;
    findByUserId(userId: number): Promise<Account | null>;
}
