import { Repository, QueryRunner, In, Like } from 'typeorm';
import CODE from '../../dbs/main/entities/codeEntity';
import INFO from '../../dbs/main/entities/infoEntity';
import { StockTransaction } from '../../dbs/main/entities/stockTransactionEntity';
import {
    CreateStockTransactionLogRequest,
    FinanceResponse,
    GetStockTransactionsResponse,
    GetStockWithCapResponse,
    IStockService,
    MyStockResponse,
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
import beta from '../../dbs/main/entities/betaEntity';

export class StockService implements IStockService {
    userService: IUserService;
    portfolioService: IPortfolioService;
    name: string = 'StockService';
    stockRepository: Repository<CODE>;
    stockTransactionRepository: Repository<StockTransaction>;
    financeRepository: Repository<Finance>;
    priceRepository: Repository<Price>;
    infoRepository: Repository<INFO>;
    queryRunner: QueryRunner;
    betaRepository: Repository<beta>;

    constructor(queryRunner: QueryRunner) {
        this.setQueryRunner(queryRunner);
    }

    setQueryRunner(queryRunner: QueryRunner): void {
        this.queryRunner = queryRunner;
        this.betaRepository = queryRunner.manager.getRepository(beta);
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
    async showStocks(): Promise<any> {
        return this.stockRepository.find();
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
    async getDesc(code: string): Promise<any> {
        console.log(code)
        const desc = await this.infoRepository.find()
        console.log(desc)
        return desc
    }
  
    @Transaction()
    async getRecentPrice(code: string): Promise<number> {
        // TODO: 최근가격을 Redis로 교체할 필요가 있음.
        let Code = new CODE();
        Code.krxCode = code;
        console.log(code);
        const price = await this.priceRepository.findOne({
            where: {
                code: Code,
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

        const beta = await this.betaRepository.findOne({ where: { krxCode: stockCode.krxCode } });
        return this.toFinanceResponse(recentPrice.ePr, finances, beta);
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
    async getMyStockInfo(code: string, userId: number): Promise<MyStockResponse> {
        const portfolios = await this.portfolioService.getAllPortfolios(userId);
        const stock = await this.findByCode(code, true);
        let sum = 0;
        let numOfStocks = 0;
        for (const portfolio of portfolios) {
            const port = await this.portfolioService.getPortfolioByIdAndOwner(portfolio.id, userId, true);

            port.portfolioItems.forEach((item) => {
                if (item.krxCode.krxCode === code) {
                    sum += item.avg * item.amount;
                    numOfStocks += Number(item.amount);
                }
            });
        }

        const beta = await this.betaRepository.findOne({ where: { krxCode: code } });

        const getTrust = (beta: beta) => {
            if (!beta) return 'C';

            if (beta.beta > 2) return 'B+';
            if (beta.beta > 1) return 'A';
            if (beta.beta > 0.5) return 'A+';

            return 'B';
        };

        return {
            num: numOfStocks,
            avg: sum / numOfStocks ? sum / numOfStocks : 0,
            trust: beta ? getTrust(beta) : 'C',
        };
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

            return {
                ...response,
                chartLength: stockCharts.length,
                chart: stockCharts,
            };
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

            return {
                ...response,
                chartLength: stockCharts.length,
                chart: stockCharts,
            };
        }

        const stockCharts = await this.priceRepository
            .createQueryBuilder('price')
            .where('code = :code', { code: code })
            .andWhere('date between :prev and now()', { prev: after })
            .orderBy('price.date', 'DESC')
            .getRawMany();

        return { ...response, chartLength: stockCharts.length, chart: stockCharts };
    }

    @Transaction()
    async getStocksOrderByCap(page?: number, size?: number): Promise<GetStockWithCapResponse> {
        if (!size) size = 7;
        if (!page) page = 1;

        const lastDate = this.financeRepository
            .createQueryBuilder()
            .subQuery()
            .addSelect('last.code, max(last.yymm) as last_date')
            .from(Finance, 'last')
            .groupBy('last.code')
            .getQuery();

        const [stocks, total] = await this.financeRepository
            .createQueryBuilder('finance')
            .innerJoin(lastDate, 'lastDate', 'finance.code = lastDate.code and finance.yymm = lastDate.last_date')
            .leftJoinAndSelect('finance.code', 'CODE')
            .take(size)
            .skip((page - 1) * size)
            .orderBy('finance.cap', 'DESC')
            .getManyAndCount();

        return {
            total: total,
            size: size,
            page: page,
            lastPage: Math.ceil(total / size),
            data: stocks.map((stock) => ({
                code: stock.code.krxCode,
                name: stock.code.name,
                cap: stock.cap,
                yymm: stock.yymm,
            })),
        };
    }

    toFinanceResponse(price: number, finances: Finance[], beta: beta | null): FinanceResponse {
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
            beta: beta ? beta.beta : 1,
            revGrownthRate: ((recent.rev - old.rev) / Math.abs(old.rev)) * 100,
            incomeGrownthRate: ((recent.income - old.income) / Math.abs(old.income)) * 100,
            netincomeGrownthRate: ((recent.netincome - old.netincome) / Math.abs(old.netincome)) * 100,
            incomeRate: recent.income / Math.abs(recent.rev), // 영업 이익률
            netincomeRate: recent.netincome / Math.abs(recent.rev), // 순이익률
        };

        return finance;
    }

    @Transaction()
    async getStockInfo(stockId: string): Promise<INFO[]> {
        try {
            const response = await this.infoRepository.find();
            return response;
        } catch (error) {
            throw new Error('Method not implemented.');
        }
    }
}
