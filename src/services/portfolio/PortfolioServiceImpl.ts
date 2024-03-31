import { Repository, QueryRunner } from 'typeorm';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
import PortfolioItems from '../../dbs/main/entities/PortfolioItemsEntity';
import { IBalanceService } from '../balance/IBalanceService';
import { Transaction } from '../transaction';
import { IStockService } from '../stock/IStockService';
import { PortfolioItemRequest, IPortfolioService, PortfolioDetailResponse } from './IPortfolioService';
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
    async findPortById(portId: number, withItem?: boolean): Promise<PORTFOILIO | null> {
        return await this.portfolioRepository.findOne({
            where: { id: portId },
            relations: {
                user: true,
                portfolioItems: {
                    krxCode: withItem,
                },
            },
        });
    }

    @Transaction()
    async getAllPortfolios(userId: number, withDeleted?: boolean): Promise<PORTFOILIO[]> {
        if (withDeleted) {
            return this.portfolioRepository
                .createQueryBuilder('portfolio')
                .leftJoinAndSelect('portfolio.portfolioItems', 'portfolioItems')
                .leftJoinAndSelect('portfolioItems.krxCode', 'CODE')
                .where('portfolio.userId = :userId', { userId: userId })
                .withDeleted()
                .getMany();
        }

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
    async getPortfolioWithRatio(portId: number, userId: number): Promise<PortfolioDetailResponse> {
        const portfolio = await this.getPortfolioByIdAndOwner(portId, userId, true);

        const totalPrice = portfolio.portfolioItems.reduce((acc, cur) => acc + cur.avg * cur.amount, 0);

        return {
            id: portfolio.id,
            totalPrice: totalPrice,
            portName: portfolio.portName,
            isMain: portfolio.isMain,
            portfolioItems: portfolio.portfolioItems.map((item: PortfolioItems) => {
                return {
                    ratio: ((item.amount * item.avg) / totalPrice) * 100,
                    amount: item.amount,
                    avg: item.avg,
                    stockName: item.krxCode.name,
                    stockCode: item.krxCode.krxCode,
                };
            }),
        };
    }

    @Transaction()
    async getPortfolioByIdAndOwner(portId: number, userId: number, withItem?: boolean): Promise<PORTFOILIO> {
        const portfolio = await this.findPortById(portId, withItem);
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
            if (item.amount <= 0) throw new ApplicationError(400, '수량은 최소 1개 이상이어야 합니다.');
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
            if (item.amount <= 0) throw new ApplicationError(400, '수량은 0보다 커야 합니다.');
            if (portfolioItem.amount < item.amount) {
                throw new ApplicationError(400, '보유 주식보다 더 많이 팔 수 없습니다.');
            }

            // bigint는 typeorm에서 string으로 처리됨...
            if (Number(portfolioItem.amount) === item.amount) {
                deleteItemIds.push(portfolioItem.id);
                continue;
            }

            await this.portfolioItemRepository.update(portfolioItem.id, {
                amount: () => `amount - ${item.amount}`,
            });
        }

        if (deleteItemIds.length > 0) await this.portfolioItemRepository.softDelete(deleteItemIds);

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

        if (await this.portfolioRepository.existsBy({ user: { id: userId }, portName: portName })) {
            throw new ApplicationError(400, '포트폴리오 이름 중복');
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

    @Transaction()
    async deleteById(portId: number, userId: number): Promise<void> {
        const portfolio = await this.getPortfolioByIdAndOwner(portId, userId, true);

        if (portfolio.isMain) {
            throw new ApplicationError(400, '메인 포트폴리오는 삭제할 수 없습니다.');
        }

        const minusItemRequest: PortfolioItemRequest[] = await Promise.all(
            portfolio.portfolioItems.map(async (item) => {
                const price = await this.stockService.getRecentPrice(item.krxCode.krxCode);

                return {
                    krxCode: item.krxCode.krxCode,
                    amount: item.amount,
                    price: price,
                };
            })
        );

        await this.minusPortfolioItem(minusItemRequest, portId, userId);

        await this.portfolioRepository.softRemove(portfolio);
    }
}
