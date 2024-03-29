import { Repository, QueryRunner } from 'typeorm';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
import PortfolioItems from '../../dbs/main/entities/PortfolioItemsEntity';
import { IBalanceService } from '../balance/IBalanceService';
import { Transaction } from '../transaction';
import { IStockService } from '../stock/IStockService';
import { PortfolioItemRequest, IPortfolioService, SetPortfolioItemRequest } from './IPortfolioService';
import CODE from '../../dbs/main/entities/codeEntity';
import { IUserService } from '../user/IUserService';
import ApplicationError from '../../utils/error/applicationError';
import { TransactionType } from '../../dbs/main/entities/stockTransactionEntity';
import { BalanceService } from '../balance/BalanceServiceImpl';
import { StockService } from '../stock/StockServiceImpl';
import { UserService } from '../user/UserServiceImpl';
import { createService } from '../serviceCreator';

export class PortfolioService implements IPortfolioService {
    queryRunner: QueryRunner;
    name: string = 'PortfolioService';

    portfolioRepository: Repository<PORTFOILIO>;
    portfolioItemRepository: Repository<PortfolioItems>;

    balanceService: IBalanceService;
    stockService: IStockService;
    userService: IUserService;

    constructor(queryRunner: QueryRunner) {
        this.setQueryRunner(queryRunner);
    }

    setQueryRunner(queryRunner: QueryRunner): void {
        this.queryRunner = queryRunner;
        this.portfolioRepository = queryRunner.manager.getRepository(PORTFOILIO);
        this.portfolioItemRepository = queryRunner.manager.getRepository(PortfolioItems);

        this.balanceService = createService(queryRunner, BalanceService.name, this, this.name) as IBalanceService;
        this.stockService = createService(queryRunner, StockService.name, this, this.name) as IStockService;
        this.userService = createService(queryRunner, UserService.name, this, this.name) as IUserService;
    }

    @Transaction()
    async findPortById(portId: number): Promise<PORTFOILIO | null> {
        return await this.portfolioRepository.findOne({ where: { id: portId }, relations: { user: true } });
    }

    @Transaction()
    async getAllPortfolios(userId: number): Promise<PORTFOILIO[]> {
        return this.portfolioRepository
            .createQueryBuilder('portfolio')
            .leftJoinAndSelect('portfolio.portfolioItems', 'portfolioItems')
            .leftJoinAndSelect('portfolioItems.krxCode', 'CODE')
            .where('portfolio.userId = :userId', { userId: userId })
            .getMany();
    }

    @Transaction()
    async findPortItemByCodeAndPort(portId: number, code: string): Promise<PortfolioItems | null> {
        return await this.portfolioItemRepository
            .createQueryBuilder()
            .where('portId=:portId', { portId: portId })
            .andWhere('krxCode=:krxCode', { krxCode: code })
            .getOne();
    }

    @Transaction()
    async getPortfolioByIdAndOwner(portId: number, userId: number): Promise<PORTFOILIO> {
        const portfolio = await this.findPortById(portId);
        if (!portfolio) {
            throw new ApplicationError(400, '포트폴리오 번호가 존재하지 않음');
        }

        if (portfolio.user.id !== userId) {
            throw new ApplicationError(400, '포트폴리오 주인이 아닙니다.');
        }

        return portfolio;
    }

    @Transaction()
    async addPortfolioItem(items: PortfolioItemRequest[], portId: number, userId: number): Promise<void> {
        const portfolio = await this.getPortfolioByIdAndOwner(portId, userId);

        let insertItems: PortfolioItems[] = [];
        for (const item of items) {
            const portfolioItem = await this.findPortItemByCodeAndPort(portId, item.krxCode);

            if (portfolioItem) {
                await this.portfolioItemRepository.update(portfolioItem.id, {
                    avg: () => `((amount*avg+${item.amount * item.price})/(amount+${item.amount}))`,
                    amount: () => `amount + ${item.amount}`,
                });
            } else {
                let tmpItem = new PortfolioItems();
                tmpItem.amount = item.amount;
                tmpItem.avg = item.price;

                let code = new CODE();
                code.krxCode = item.krxCode;
                tmpItem.krxCode = code;
                tmpItem.portfolio = portfolio;
                insertItems.push(tmpItem);
            }
        }

        // 차감 후, 포폴에 넣기, 거래내역 남기기
        await this.balanceService.withdrawByUserId(
            userId,
            items.reduce((acc, cur) => acc + cur.amount * cur.price, 0)
        );
        await this.portfolioItemRepository.insert(insertItems);
        await this.stockService.createLog({
            stock: items,
            portId: portId,
            transactionType: TransactionType.BUY,
        });
    }

    @Transaction()
    async minusPortfolioItem(items: PortfolioItemRequest[], portId: number, userId: number): Promise<void> {
        const portfolio = await this.getPortfolioByIdAndOwner(portId, userId);

        let deleteItemIds: number[] = [];
        for (const item of items) {
            const portfolioItem = await this.findPortItemByCodeAndPort(portId, item.krxCode);
            if (!portfolioItem) throw new ApplicationError(400, '해당 주식은 포트폴리오 내에 존재하지 않습니다.');
            if (portfolioItem.amount < item.amount) {
                throw new ApplicationError(400, '보유 주식보다 더 많이 팔 수 없습니다.');
            }

            if (portfolioItem.amount === item.amount) {
                deleteItemIds.push(portfolioItem.id);
                continue;
            }

            await this.portfolioItemRepository.update(portfolioItem.id, {
                amount: () => `amount - ${item.amount}`,
            });
        }

        if (deleteItemIds.length > 0) await this.portfolioItemRepository.delete(deleteItemIds);

        await this.balanceService.depositByUserId(
            userId,
            items.reduce((acc, cur) => acc + cur.amount * cur.price, 0)
        );
        await this.stockService.createLog({
            stock: items,
            portId: portId,
            transactionType: TransactionType.CELL,
        });
    }

    @Transaction()
    async createPortfolio(
        userId: number,
        portName: string,
        items?: PortfolioItemRequest[],
        isMain?: boolean
    ): Promise<PORTFOILIO> {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new ApplicationError(400, '유저 존재하지 않음');
        }

        const portfolio: PORTFOILIO = await this.portfolioRepository.save({
            portName: portName,
            user: { id: userId },
            isMain: isMain,
        });

        if (items) {
            await this.addPortfolioItem(items, portfolio.id, userId);
        }

        return portfolio;
    }
    async deletePortfolio(portfolio: PORTFOILIO): Promise<any> {
        await this.portfolioItemRepository.delete({ portfolio: portfolio });
        await this.portfolioRepository.delete({ id: portfolio.id });
    }
}
