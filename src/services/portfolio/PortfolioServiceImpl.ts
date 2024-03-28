import { Repository, QueryRunner } from 'typeorm';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
import PortfolioItems from '../../dbs/main/entities/PortfolioItemsEntity';
import User from '../../dbs/main/entities/userEntity';
import { IBalanceService } from '../balance/IBalanceService';
import { Transaction } from '../transaction';
import { IStockService } from '../stock/IStockService';
import { AddStockInfoRequest, IPortfolioService, SetPortfolioItemRequest } from './IPortfolioService';
import { BalanceService } from '../balance/BalanceServiceImpl';
import { StockService } from '../stock/StockServiceImpl';
import CODE from '../../dbs/main/entities/codeEntity';

export class PortfolioService implements IPortfolioService {
    queryRunner: QueryRunner;
    name: string = 'PortfolioService';

    portfolioRepository: Repository<PORTFOILIO>;
    portfolioItemRepository: Repository<PortfolioItems>;

    balanceService: IBalanceService;
    stockService: IStockService;
    static getAllPortfolios: any; // static property

    constructor(queryRunner: QueryRunner) {
        this.setQueryRunner(queryRunner);
    }

    setQueryRunner(queryRunner: QueryRunner): void {
        this.queryRunner = queryRunner;
        this.portfolioRepository = queryRunner.manager.getRepository(PORTFOILIO);
        this.portfolioItemRepository = queryRunner.manager.getRepository(PortfolioItems);

        if (!this.queryRunner.instances) {
            this.queryRunner.instances = [];
        }

        this.queryRunner.instances.push(this.name);

        if (this.queryRunner.instances.includes(BalanceService.name)) {
            return;
        }
        this.balanceService = new BalanceService(queryRunner);

        if (this.queryRunner.instances.includes(StockService.name)) {
            return;
        }
        this.stockService = new StockService(queryRunner);
    }
    async findportbyId(portId : number) : Promise<any>{
        return await this.portfolioRepository.findOneBy({id : portId})
    }
    @Transaction()
    async getAllPortfolios(userId: number): Promise<PORTFOILIO[]> {
        return this.portfolioRepository.createQueryBuilder('portfolio')
        .leftJoinAndSelect('portfolio.portfolioItems', 'portfolioItems')
        .leftJoinAndSelect('portfolioItems.krxCode', 'CODE')
        .where('portfolio.userId = :userId', {userId: userId})
        .getMany();

    }
    async addPortfolioItem(items : PortfolioItems ): Promise<void> {
        items.avg = 0
        await this.portfolioItemRepository.save(items)
    }
    async minusPortfolioItem(request: SetPortfolioItemRequest): Promise<void> {
        throw new Error('Method not implemented.');
    }
    //리턴형식이 Portfolio인데 오피셜타입이 아니라 객체가 Portfolio인척 흉내내는 애라서 부득이하게 any로 함 일단
    async createPortfolio(user: User, portName: string, items?: AddStockInfoRequest[] | undefined): Promise<any> {
        // throw new Error('Method not implemented.');
        return await this.portfolioRepository.save({portName : portName, user : user, isMain : false });     
    }   
    async deletePortfolio(portfolio: PORTFOILIO): Promise<any> {
        // throw new Error('Method not implemented.');
        await this.portfolioItemRepository.delete({portfolio : portfolio})
        await this.portfolioRepository.delete({id : portfolio.id});     
    }   
}
