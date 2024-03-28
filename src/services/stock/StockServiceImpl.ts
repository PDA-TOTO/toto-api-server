import { Repository, QueryRunner } from 'typeorm';
import CODE from '../../dbs/main/entities/codeEntity';
import { StockTransaction } from '../../dbs/main/entities/stockTransactionEntity';
import { IBalanceService } from '../balance/IBalanceService';
import { IStockService } from './IStockService';
import { BalanceService } from '../balance/BalanceServiceImpl';
import { IUserService } from '../user/IUserService';
import { UserService } from '../user/UserServiceImpl';

export class StockService implements IStockService {
    userService: IUserService;
    stockRepository: Repository<CODE>;
    stockTransactionRepository: Repository<StockTransaction>;
    balanceService: IBalanceService;
    queryRunner: QueryRunner;

    setQueryRunner(queryRunner: QueryRunner): void {
        this.queryRunner = queryRunner;
        this.stockRepository = queryRunner.manager.getRepository(CODE);
        this.stockTransactionRepository = queryRunner.manager.getRepository(StockTransaction);
        this.balanceService = new BalanceService(queryRunner);
        this.userService = new UserService(queryRunner);
    }

    buyStock(email: string, code: string, amount: number, price: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    cellStock(email: string, code: string, amount: number, price: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
