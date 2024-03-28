import { QueryRunner, Repository } from 'typeorm';
import { AccountResponse, IBalanceService } from './IBalanceService';
import Account from '../../dbs/main/entities/accountEntity';
import User from '../../dbs/main/entities/userEntity';
import { Transaction } from '../transaction';
import { IStockService } from '../stock/IStockService';
import { StockService } from '../stock/StockServiceImpl';
import ApplicationError from '../../utils/error/applicationError';

export class BalanceService implements IBalanceService {
    name: string = 'BalanceService';
    accountRepository: Repository<Account>;
    queryRunner: QueryRunner;
    stockService: IStockService;

    constructor(queryRunner: QueryRunner) {
        this.setQueryRunner(queryRunner);
    }

    setQueryRunner(queryRunner: QueryRunner): void {
        this.queryRunner = queryRunner;
        this.accountRepository = queryRunner.manager.getRepository(Account);

        if (this.queryRunner.root === StockService.constructor.name) {
            return;
        }

        this.stockService = new StockService(queryRunner);
    }

    @Transaction()
    deposit(accountId: number, amount: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    @Transaction()
    withdraw(accountId: number, amount: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    @Transaction()
    async findByUserId(userId: number): Promise<Account | null> {
        return await this.accountRepository.findOne({ where: { user: { id: userId } } });
    }

    @Transaction()
    async createAccount(user: User): Promise<AccountResponse> {
        const account: Account = await this.accountRepository.save({
            user: user,
            amount: 10000000,
            account: this.generateAccountNumber(),
        });

        return {
            id: account.id,
            amount: account.amount,
            account: account.account,
        };
    }

    private generateAccountNumber() {
        const accountNumberLength = 11; // 계좌 번호의 길이를 설정
        const characters = '0123456789'; // 계좌 번호에 포함될 문자열
        let accountNumber = '100-';
        for (let i = 0; i < accountNumberLength + 1; i++) {
            if (i === 7) {
                accountNumber += '-';
            } else {
                const randomIndex = Math.floor(Math.random() * characters.length);
                accountNumber += characters[randomIndex];
            }
        }
        return accountNumber;
    }

    private canDeposit() {}
}
