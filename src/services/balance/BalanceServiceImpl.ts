import { QueryRunner, Repository } from 'typeorm';
import { AccountResponse, IBalanceService } from './IBalanceService';
import Account from '../../dbs/main/entities/accountEntity';
import User from '../../dbs/main/entities/userEntity';
import { Transaction } from '../transaction';
import { IStockService } from '../stock/IStockService';
import ApplicationError from '../../utils/error/applicationError';
import { createService } from '../serviceCreator';
import { StockService } from '../stock/StockServiceImpl';

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
        this.stockService = createService(queryRunner, StockService.name, this, this.name) as IStockService;
    }

    @Transaction()
    async findByAccountId(accountId: number): Promise<Account | null> {
        return await this.accountRepository.findOne({ where: { id: accountId } });
    }

    @Transaction()
    async depositByAccountId(accountId: number, amount: number): Promise<void> {
        const account = await this.findByAccountId(accountId);
        if (!account) {
            throw new ApplicationError(400, '계좌가 존재하지 않음');
        }

        await this.deposit(account, amount);
    }

    @Transaction()
    async withdrawByAccountId(accountId: number, amount: number): Promise<void> {
        const account = await this.findByAccountId(accountId);
        if (!account) {
            throw new ApplicationError(400, '계좌가 존재하지 않음');
        }

        await this.withdraw(account, amount);
    }

    @Transaction()
    async depositByUserId(userId: number, amount: number): Promise<void> {
        const account = await this.findByUserId(userId);

        if (!account) {
            throw new ApplicationError(400, '해당 유저의 계좌가 존재하지 않음');
        }

        await this.deposit(account, amount);
    }

    @Transaction()
    async withdrawByUserId(userId: number, amount: number): Promise<void> {
        const account = await this.findByUserId(userId);

        if (!account) {
            throw new ApplicationError(400, '해당 유저의 계좌가 존재하지 않음');
        }

        await this.withdraw(account, amount);
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

    @Transaction()
    async deposit(account: Account, amount: number) {
        await this.accountRepository.update(account.id, {
            amount: () => `amount + ${amount}`,
        });
    }

    @Transaction()
    async withdraw(account: Account, amount: number): Promise<void> {
        if (account.amount < amount) {
            throw new ApplicationError(400, '잔고 부족');
        }

        await this.accountRepository.update(account.id, {
            amount: () => `amount - ${amount}`,
        });
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
}
