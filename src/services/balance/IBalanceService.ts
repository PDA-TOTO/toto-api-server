import { Repository } from 'typeorm';
import { IService } from '../IService';
import Account from '../../dbs/main/entities/accountEntity';
import User from '../../dbs/main/entities/userEntity';
import { IStockService } from '../stock/IStockService';

export type AccountResponse = {
    id: number;
    amount: number;
    account: string;
};

export interface IBalanceService extends IService {
    accountRepository: Repository<Account>;
    stockService: IStockService;

    createAccount(user: User): Promise<AccountResponse>;
    findByUserId(userId: number): Promise<Account | null>;
    deposit(accountId: number, amount: number): Promise<void>;
    withdraw(accountId: number, amount: number): Promise<void>;
}
