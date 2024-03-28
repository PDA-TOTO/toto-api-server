import { Repository, QueryRunner } from 'typeorm';
import CODE from '../../dbs/main/entities/codeEntity';
import { StockTransaction } from '../../dbs/main/entities/stockTransactionEntity';
import { CreateStockTransactionLogRequest, IStockService } from './IStockService';
import { IUserService } from '../user/IUserService';
import { UserService } from '../user/UserServiceImpl';
import { Transaction } from '../transaction';

export class StockService implements IStockService {
    name: string = 'StockService';
    userService: IUserService;
    stockRepository: Repository<CODE>;
    stockTransactionRepository: Repository<StockTransaction>;
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
