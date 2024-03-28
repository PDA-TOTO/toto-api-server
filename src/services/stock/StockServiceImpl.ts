import { Repository, QueryRunner } from 'typeorm';
import CODE from '../../dbs/main/entities/codeEntity';
import { StockTransaction } from '../../dbs/main/entities/stockTransactionEntity';
import { CreateStockTransactionLogRequest, IStockService } from './IStockService';
import { IUserService } from '../user/IUserService';
import { UserService } from '../user/UserServiceImpl';
import { Transaction } from '../transaction';

export class StockService implements IStockService {
    userService: IUserService;
    stockRepository: Repository<CODE>;
    stockTransactionRepository: Repository<StockTransaction>;
    queryRunner: QueryRunner;

    constructor(queryRunner: QueryRunner) {
        this.setQueryRunner(queryRunner);
    }

    setQueryRunner(queryRunner: QueryRunner): void {
        this.queryRunner = queryRunner;
        this.stockRepository = queryRunner.manager.getRepository(CODE);
        this.stockTransactionRepository = queryRunner.manager.getRepository(StockTransaction);
        this.userService = new UserService(queryRunner);
    }

    @Transaction()
    async findByCode(code: string): Promise<CODE | null> {
        return await this.stockRepository.findOne({ where: { krxCode: code } });
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
}
