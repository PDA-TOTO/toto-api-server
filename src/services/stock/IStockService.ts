import { Repository } from 'typeorm';
import { IService } from '../IService';
import CODE from '../../dbs/main/entities/codeEntity';
import { StockTransaction, TransactionType } from '../../dbs/main/entities/stockTransactionEntity';
import { IUserService } from '../user/IUserService';
import { Account } from '../user/userServiceReturnType';
import Price from '../../dbs/main/entities/priceEntity';
import Finance from '../../dbs/main/entities/financeEntity';

export type CreateStockTransactionLogRequest = {
    code: CODE;
    price: number;
    amount: number;
    account: Account;
    transactionType: TransactionType;
};

export type FinanceResponse = {
    code: string;
    yymm: string;
    rev: number;
    income: number;
    netincome: number;
    roeVal: number;
    eps: number;
    lbltRate: number;
    bps: number;
    incomeRate: number;
    incomeGrownthRate: number;
    netincomeGrownthRate: number;
    per: number;
    cap: number;
    pbr: number;
    dividend: number;
    dividendRate: number;
    quickRatio: number;
    consensus: number;
    beta: number;
    revGrownthRate: number;
    netincomeRate: number;
};

export interface IStockService extends IService {
    stockRepository: Repository<CODE>;
    stockTransactionRepository: Repository<StockTransaction>;
    financeRepository: Repository<Finance>;
    priceRepository: Repository<Price>;
    userService: IUserService;

    findByCode(code: string, isRelationFinance?: boolean): Promise<CODE | null>;
    createLog(request: CreateStockTransactionLogRequest): Promise<void>;
    getFinanceByCode(code: string): Promise<FinanceResponse>;
}
