import { Repository } from 'typeorm';
import { IService } from '../IService';
import CODE from '../../dbs/main/entities/codeEntity';
import { StockTransaction, TransactionType } from '../../dbs/main/entities/stockTransactionEntity';
import { IUserService } from '../user/IUserService';
import { Account } from '../user/userServiceReturnType';

export type CreateStockTransactionLogRequest = {
    code: CODE;
    price: number;
    amount: number;
    account: Account;
    transactionType: TransactionType;
};

export interface IStockService extends IService {
    stockRepository: Repository<CODE>;
    stockTransactionRepository: Repository<StockTransaction>;
    userService: IUserService;

    findByCode(code: string): Promise<CODE | null>;
    createLog(request: CreateStockTransactionLogRequest): Promise<void>;
}
