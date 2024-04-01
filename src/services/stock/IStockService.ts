import { Repository } from 'typeorm';
import { IService } from '../IService';
import CODE from '../../dbs/main/entities/codeEntity';
import { StockTransaction, TransactionType } from '../../dbs/main/entities/stockTransactionEntity';
import { IUserService } from '../user/IUserService';
import Price from '../../dbs/main/entities/priceEntity';
import Finance from '../../dbs/main/entities/financeEntity';
import { IPortfolioService } from '../portfolio/IPortfolioService';
import INFO from '../../dbs/main/entities/infoEntity';

export type LogStock = {
    krxCode: string;
    price: number;
    amount: number;
};
export type CreateStockTransactionLogRequest = {
    stock: LogStock[];
    portId: number;
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

export type StockChartResponse = {
    chartLength: number;
    chart: any[];
    code: string;
    name: string;
    bundleUnit: string;
};

export type GetStockTransactionsResponse = {
    total: number;
    size: number;
    page: number;
    lastPage: number;
    data: StockTransaction[];
};

export type GetStockWithCapResponse = {
    total: number;
    size: number;
    page: number;
    lastPage: number;
    data: {
        code: string;
        name: string;
        cap: number;
        yymm: string;
    }[];
};

export type MyStockResponse = {
    num: number;
    avg: number;
    trust: string;
};

export interface IStockService extends IService {
    stockRepository: Repository<CODE>;
    stockTransactionRepository: Repository<StockTransaction>;
    financeRepository: Repository<Finance>;
    priceRepository: Repository<Price>;
    infoRepository: Repository<INFO>;
    userService: IUserService;
    portfolioService: IPortfolioService;

    findByCode(code: string, isRelationFinance?: boolean): Promise<CODE | null>;
    createLog(request: CreateStockTransactionLogRequest): Promise<void>;
    getFinanceByCode(code: string): Promise<FinanceResponse>;
    getInfoWithChart(
        code: string,
        after: Date | null,
        bundleUnit?: 'DAY' | 'MONTH' | 'YEAR' | undefined
    ): Promise<StockChartResponse>;
    findStockTransactionByUserId(userId: number, size?: number, page?: number): Promise<GetStockTransactionsResponse>;
    getRecentPrice(code: string): Promise<number>;
    searchStock(name: string): Promise<CODE[]>;
    getStocksOrderByCap(page?: number, size?: number): Promise<GetStockWithCapResponse>;
    getStockInfo(stockId: string): Promise<INFO[]>;
    getMyStockInfo(code: string, userId: number): Promise<MyStockResponse>;
}
