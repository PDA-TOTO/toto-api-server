import { Repository, QueryRunner, In, Like } from 'typeorm';
import CODE from '../../dbs/main/entities/codeEntity';
import { StockTransaction } from '../../dbs/main/entities/stockTransactionEntity';
import {
    CreateStockTransactionLogRequest,
    FinanceResponse,
    GetStockTransactionsResponse,
    IStockService,
    StockChartResponse,
} from './IStockService';
import { IUserService } from '../user/IUserService';
import { Transaction } from '../transaction';
import ApplicationError from '../../utils/error/applicationError';
import Finance from '../../dbs/main/entities/financeEntity';
import Price from '../../dbs/main/entities/priceEntity';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
import { UserService } from '../user/UserServiceImpl';
import { createService } from '../serviceCreator';
import { IPortfolioService } from '../portfolio/IPortfolioService';
import { PortfolioService } from '../portfolio/PortfolioServiceImpl';

export class StockService implements IStockService {
    userService: IUserService;
    portfolioService: IPortfolioService;
    name: string = 'StockService';
    stockRepository: Repository<CODE>;
    stockTransactionRepository: Repository<StockTransaction>;
    financeRepository: Repository<Finance>;
    priceRepository: Repository<Price>;
    queryRunner: QueryRunner;

    constructor(queryRunner: QueryRunner) {
        this.setQueryRunner(queryRunner);
    }

    setQueryRunner(queryRunner: QueryRunner): void {
        this.queryRunner = queryRunner;
        this.stockRepository = queryRunner.manager.getRepository(CODE);
        this.stockTransactionRepository = queryRunner.manager.getRepository(StockTransaction);
        this.financeRepository = queryRunner.manager.getRepository(Finance);
        this.priceRepository = queryRunner.manager.getRepository(Price);
        this.userService = createService(queryRunner, UserService.name, this, this.name) as IUserService;
        this.portfolioService = createService(queryRunner, PortfolioService.name, this, this.name) as IPortfolioService;
    }

    @Transaction()
    async findByCode(code: string, isRelationFinance?: boolean): Promise<CODE | null> {
        return await this.stockRepository.findOne({
            where: { krxCode: code },
            relations: {
                finances: isRelationFinance,
            },
        });
    }

    @Transaction()
    async createLog(request: CreateStockTransactionLogRequest): Promise<void> {
        const stockTransactions: StockTransaction[] = request.stock.map((s) => {
            const stockTransaction = new StockTransaction();
            stockTransaction.amount = s.amount;
            stockTransaction.price = s.price;
            stockTransaction.transactionType = request.transactionType;

            const port = new PORTFOILIO();
            port.id = request.portId;
            stockTransaction.portfolio = port;

            const code = new CODE();
            code.krxCode = s.krxCode;
            stockTransaction.code = code;

            return stockTransaction;
        });

        await this.stockTransactionRepository.insert(stockTransactions);
    }

    @Transaction()
    async getRecentPrice(code: string): Promise<number> {
        // TODO: 최근가격을 Redis로 교체할 필요가 있음.
        const price = await this.priceRepository.findOne({
            where: {
                code: {
                    krxCode: code,
                },
            },
            order: {
                date: 'DESC',
            },
        });

        if (!price) throw new ApplicationError(400, '해당 코드가 존재하지 않습니다.');

        // 종가를 기준으로 줌
        return price.ePr;
    }

    @Transaction()
    async getFinanceByCode(code: string): Promise<FinanceResponse> {
        const stockCode = await this.findByCode(code);
        if (!stockCode) throw new ApplicationError(400, '해당 주식이 존재하지 않음');

        const finances: Finance[] = await this.financeRepository.find({
            take: 4,
            skip: 0,
            order: { yymm: 'DESC' },
            where: { code: stockCode },
            relations: { code: true },
        });

        const recentPrice: Price | null = await this.priceRepository.findOne({
            where: { code: stockCode },
            order: { date: 'DESC' },
        });

        if (!recentPrice) throw new ApplicationError(500, 'PRICE NULL');
        return this.toFinanceResponse(recentPrice.ePr, finances);
    }

    @Transaction()
    async findStockTransactionByUserId(
        userId: number,
        size?: number,
        page?: number
    ): Promise<GetStockTransactionsResponse> {
        if (!size) size = 7;
        if (!page) page = 1;

        const portfolios = await this.portfolioService.getAllPortfolios(userId, true);

        const [stockTransactions, total] = await this.stockTransactionRepository.findAndCount({
            where: {
                portfolio: {
                    id: In(portfolios.map((p) => p.id)),
                },
            },
            withDeleted: true,
            relations: {
                portfolio: true,
                code: true,
            },
            take: size,
            skip: (page - 1) * size,
            order: {
                createdAt: 'DESC',
            },
        });

        return {
            total: total,
            size: size,
            page: page,
            lastPage: Math.ceil(total / size),
            data: stockTransactions,
        };
    }

    @Transaction()
    async searchStock(name: string): Promise<CODE[]> {
        return this.stockRepository.find({ where: { name: Like(`%${name}%`) } });
    }

    @Transaction()
    async getInfoWithChart(
        code: string,
        after: Date | null,
        bundleUnit?: 'DAY' | 'MONTH' | 'YEAR' | undefined
    ): Promise<StockChartResponse> {
        const stockCode = await this.findByCode(code);
        if (!stockCode) throw new ApplicationError(400, '해당 주식이 존재하지 않음');

        // 2달 전이 default
        if (!after) {
            after = new Date();
            after.setMonth(after.getMonth() - 2);
        }

        if (!bundleUnit) {
            bundleUnit = 'DAY';
        }

        let response: StockChartResponse = {
            chartLength: 0,
            chart: [],
            code: stockCode.krxCode,
            name: stockCode.name,
            bundleUnit: bundleUnit,
        };

        if (bundleUnit === 'YEAR') {
            const stockCharts = await this.priceRepository
                .createQueryBuilder('price')
                .select(`DATE_FORMAT(price.date, '%Y') as year, ceiling(avg(price.ePr)) as epr`)
                .where('code = :code', { code: code })
                .andWhere('date between :prev and now()', { prev: after })
                .orderBy('year', 'DESC')
                .groupBy(`DATE_FORMAT(price.date, '%Y')`)
                .getRawMany();

            return { ...response, chartLength: stockCharts.length, chart: stockCharts };
        }

        if (bundleUnit === 'MONTH') {
            const stockCharts = await this.priceRepository
                .createQueryBuilder('price')
                .select(`DATE_FORMAT(price.date, '%Y-%m') as yymm, ceiling(avg(price.ePr)) as epr`)
                .where('code = :code', { code: code })
                .andWhere('date between :prev and now()', { prev: after })
                .orderBy('yymm', 'DESC')
                .groupBy(`DATE_FORMAT(price.date, '%Y-%m')`)
                .getRawMany();

            return { ...response, chartLength: stockCharts.length, chart: stockCharts };
        }

        const stockCharts = await this.priceRepository
            .createQueryBuilder('price')
            .where('code = :code', { code: code })
            .andWhere('date between :prev and now()', { prev: after })
            .orderBy('price.date', 'DESC')
            .getRawMany();

        return { ...response, chartLength: stockCharts.length, chart: stockCharts };
    }

    toFinanceResponse(price: number, finances: Finance[]): FinanceResponse {
        const recent: Finance = finances[0];
        const old: Finance = finances[1];

        let allEps = 0;
        finances.forEach((f) => {
            allEps += f.eps;
        });

        const finance: FinanceResponse = {
            code: recent.code.krxCode,
            yymm: recent.yymm,
            rev: recent.rev,
            income: recent.income,
            netincome: recent.netincome,
            roeVal: recent.roeVal,
            eps: recent.eps,
            lbltRate: recent.lbltRate,
            bps: recent.bps,
            per: price / allEps,
            cap: recent.cap,
            pbr: recent.pbr,
            dividend: recent.dividend,
            dividendRate: recent.dividendRate,
            quickRatio: recent.quickRatio,
            consensus: recent.consensus,
            beta: recent.beta,
            revGrownthRate: ((recent.rev - old.rev) / Math.abs(old.rev)) * 100,
            incomeGrownthRate: ((recent.income - old.income) / Math.abs(old.income)) * 100,
            netincomeGrownthRate: ((recent.netincome - old.netincome) / Math.abs(old.netincome)) * 100,
            incomeRate: recent.income / Math.abs(recent.rev), // 영업 이익률
            netincomeRate: recent.netincome / Math.abs(recent.rev), // 순이익률
        };

        return finance;
    }
}
