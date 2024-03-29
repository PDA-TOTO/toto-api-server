import { Repository, QueryRunner } from 'typeorm';
import CODE from '../../dbs/main/entities/codeEntity';
import { StockTransaction } from '../../dbs/main/entities/stockTransactionEntity';
import { CreateStockTransactionLogRequest, FinanceResponse, IStockService } from './IStockService';
import { IUserService } from '../user/IUserService';
import { UserService } from '../user/UserServiceImpl';
import { Transaction } from '../transaction';
import ApplicationError from '../../utils/error/applicationError';
import Finance from '../../dbs/main/entities/financeEntity';
import Price from '../../dbs/main/entities/priceEntity';

export class StockService implements IStockService {
    name: string = 'StockService';
    userService: IUserService;
    stockRepository: Repository<CODE>;
    stockTransactionRepository: Repository<StockTransaction>;
    financeRepository: Repository<Finance>;
    priceRepository: Repository<Price>;
    queryRunner: QueryRunner;

    constructor(queryRunner: QueryRunner) {
        this.setQueryRunner(queryRunner);
    }
    getFinance(code: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    setQueryRunner(queryRunner: QueryRunner): void {
        this.queryRunner = queryRunner;
        this.stockRepository = queryRunner.manager.getRepository(CODE);
        this.stockTransactionRepository = queryRunner.manager.getRepository(StockTransaction);
        this.financeRepository = queryRunner.manager.getRepository(Finance);
        this.priceRepository = queryRunner.manager.getRepository(Price);

        if (!this.queryRunner.instances) {
            this.queryRunner.instances = [];
        }

        this.queryRunner.instances.push(this.name);

        if (this.queryRunner.instances.includes(UserService.name)) {
            return;
        }

        this.userService = new UserService(queryRunner);
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
        await this.stockTransactionRepository.save({
            price: request.price,
            amount: request.amount,
            transactionType: request.transactionType,
            code: request.code,
            account: request.account,
        });
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
