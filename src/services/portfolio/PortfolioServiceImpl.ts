import { Repository, QueryRunner } from 'typeorm';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
import PortfolioItems from '../../dbs/main/entities/PortfolioItemsEntity';
import User from '../../dbs/main/entities/userEntity';
import { IBalanceService } from '../balance/IBalanceService';
import { IStockService } from '../stock/IStockService';
import { AddStockInfoRequest, IPortfolioService, SetPortfolioItemRequest } from './IPortFolioService';
import { BalanceService } from '../balance/BalanceServiceImpl';
import { StockService } from '../stock/StockServiceImpl';

class PortfolioService implements IPortfolioService {
    queryRunner: QueryRunner;
    name: string = 'PortfolioService';
    portfolioRepository: Repository<PORTFOILIO>;
    portfolioItemRepository: Repository<PortfolioItems>;
    balanceService: IBalanceService;
    stockService: IStockService;

    constructor(queryRunner: QueryRunner) {
        this.setQueryRunner(queryRunner);
    }

    setQueryRunner(queryRunner: QueryRunner): void {
        this.queryRunner = queryRunner;
        this.portfolioRepository = queryRunner.manager.getRepository(PORTFOILIO);
        this.portfolioItemRepository = queryRunner.manager.getRepository(PortfolioItems);

        if (this.queryRunner.root === BalanceService.name) {
            return;
        }
        this.balanceService = new BalanceService(queryRunner);

        if (this.queryRunner.root === StockService.name) {
            return;
        }
        this.stockService = new StockService(queryRunner);
    }

    async getAllPortfolios(userId: number): Promise<PORTFOILIO[]> {
        throw new Error('Method not implemented.');
    }
    async addPortfolioItem(request: SetPortfolioItemRequest): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async minusPortfolioItem(request: SetPortfolioItemRequest): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async createPortfolio(user: User, portName: string, items?: AddStockInfoRequest[] | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
