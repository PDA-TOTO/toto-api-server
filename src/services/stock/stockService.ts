import { AppDataSource } from '../../dbs/main/dataSource';
import CODE from '../../dbs/main/entities/codeEntity';
import Finance from '../../dbs/main/entities/financeEntity';
import ApplicationError from '../../utils/error/applicationError';
import Price from '../../dbs/main/entities/priceEntity';
import { In } from 'typeorm';
import { userFindByEmail } from '../user/userService';
import { StockTransaction } from '../../dbs/main/entities/stockTransactionEntity';
import Account from '../../dbs/main/entities/accountEntity';
import { StockBalance } from '../../dbs/main/entities/stockBalanceEntity';
const stockRepository = AppDataSource.getRepository(CODE);
const financeRepository = AppDataSource.getRepository(Finance);
const priceRepository = AppDataSource.getRepository(Price);
const stockBalanaceRepository = AppDataSource.getRepository(StockBalance);

const stockFindByCode = async (code: string) => {
    return await stockRepository.findOneBy({ krxCode: code });
};

export const showStocks = async () => {
    // hashing
    const user = await stockRepository.find();
    return user;
};

type FinanceResponse = {
    code: string;
    yymm: string;
    rev: number;
    income: number;
    netincome: number;
    roeVal: number;
    eps: number;
    lbltRate: number;
    bps: number;
    incomeRate: number;
    incomeGrownthRate: number;
    netincomeGrownthRate: number;
    per: number;
    cap: number;
    pbr: number;
    dividend: number;
    dividendRate: number;
    quickRatio: number;
    consensus: number;
    beta: number;
    revGrownthRate: number;
    netincomeRate: number;
};

const toFinanceResponse = (price: number, finances: Finance[]): FinanceResponse => {
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
};

export const getRecentFinance = async (code: string): Promise<FinanceResponse> => {
    const stockCode: CODE | null = await stockFindByCode(code);
    if (!stockCode) throw new ApplicationError(400, '해당 code와 매핑되는 종목이 존재하지 않음');

    const finances: Finance[] = await financeRepository.find({
        order: { yymm: 'DESC' },
        where: { code: stockCode },
        relations: { code: true },
    });

    const price: Price[] = await priceRepository.find({
        where: { code: stockCode },
        order: { date: 'DESC' },
        take: 0,
        skip: 0,
    });

    return toFinanceResponse(price[0].ePr, finances.slice(0, 4));
};

//     return user
// };

export const stocksGetAllByCode = async(codes: string[]):Promise<CODE[]> => {
    return await stockRepository.find({where: {krxCode: In(codes)}});
}
export type StockInfoResponse = {
    chartLength: number;
    chart: any[];
    code: string;
    name: string;
    bundleUnit: string;
};

export const getStockInfoWithChart = async (
    code: string,
    after?: Date | null,
    bundleUnit?: 'DAY' | 'MONTH' | 'YEAR' | undefined
): Promise<StockInfoResponse> => {
    const stockCode: CODE | null = await stockFindByCode(code);
    if (!stockCode) throw new ApplicationError(400, '해당 code와 매핑되는 종목이 존재하지 않음');

    if (!after) {
        after = new Date();
        after.setMonth(after.getMonth() - 2);
    }

    if (!bundleUnit) {
        bundleUnit = 'DAY';
    }

    if (bundleUnit === 'YEAR') {
        const stockCharts = await priceRepository
            .createQueryBuilder('price')
            .select(`DATE_FORMAT(price.date, '%Y') as year, ceiling(avg(price.ePr)) as epr`)
            .where('code = :code', { code: code })
            .andWhere('date between :prev and now()', { prev: after })
            .orderBy('year', 'DESC')
            .groupBy(`DATE_FORMAT(price.date, '%Y')`)
            .getRawMany();

        return {
            chartLength: stockCharts.length,
            chart: stockCharts,
            code: stockCode.krxCode,
            name: stockCode.name,
            bundleUnit: bundleUnit,
        };
    }

    if (bundleUnit === 'MONTH') {
        const stockCharts = await priceRepository
            .createQueryBuilder('price')
            .select(`DATE_FORMAT(price.date, '%Y-%m') as yymm, ceiling(avg(price.ePr)) as epr`)
            .where('code = :code', { code: code })
            .andWhere('date between :prev and now()', { prev: after })
            .orderBy('yymm', 'DESC')
            .groupBy(`DATE_FORMAT(price.date, '%Y-%m')`)
            .getRawMany();

        return {
            chartLength: stockCharts.length,
            chart: stockCharts,
            code: stockCode.krxCode,
            name: stockCode.name,
            bundleUnit: bundleUnit,
        };
    }

    const stockCharts = await priceRepository
        .createQueryBuilder('price')
        .where('code = :code', { code: code })
        .andWhere('date between :prev and now()', { prev: after })
        .orderBy('price.date', 'DESC')
        .getRawMany();

    return {
        chartLength: stockCharts.length,
        chart: stockCharts,
        code: stockCode.krxCode,
        name: stockCode.name,
        bundleUnit: bundleUnit,
    };
};

export const buyStock = async (code: string, userEmail: string, amount: number, price: number) => {
    const user = await userFindByEmail(userEmail);
    if (!user) {
        throw new ApplicationError(400, 'No user');
    }

    if (user.account.amount < amount * price) {
        throw new ApplicationError(400, '잔고 부족');
    }

    const stockCode: CODE | null = await stockFindByCode(code);
    if (!stockCode) throw new ApplicationError(400, '해당 code와 매핑되는 종목이 존재하지 않음');

    let response;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const account: Account = user.account;
        await queryRunner.manager.getRepository(Account).update(account.id, {
            amount: account.amount - amount * price,
        });
        account.amount -= amount * price; // 모델은 바뀌지 않았기 때문에

        const stockBalanceRepository = queryRunner.manager.getRepository(StockBalance);

        const stockBalanace = await stockBalanceRepository.findOne({
            where: {
                account: { id: account.id },
                code: { krxCode: stockCode.krxCode },
            },
        });
        if (!stockBalanace) {
            await stockBalanceRepository.save({
                account: account,
                code: stockCode,
                amount: amount,
                avg: price,
            });
        } else {
            await stockBalanceRepository.update(stockBalanace.id, {
                avg: () => `(amount * avg + ${price * amount}) / (amount + ${amount})`,
                amount: () => `amount + ${amount}`,
            });
        }

        const stockTransaction = await queryRunner.manager.getRepository(StockTransaction).save({
            user: user,
            code: stockCode,
            price: price,
            amount: amount,
        });

        response = {
            user: { email: user.email, account: account },
            price: price,
            amount: amount,
            code: stockCode,
            date: stockTransaction.createdAt,
        };

        await queryRunner.commitTransaction();

        return response;
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new ApplicationError(500, '저장되지 않음');
    } finally {
        await queryRunner.release();
    }
};

export const cellStock = async (code: string, userEmail: string, amount: number, price: number) => {
    const user = await userFindByEmail(userEmail);
    if (!user) {
        throw new ApplicationError(400, 'No user');
    }

    const stockCode: CODE | null = await stockFindByCode(code);
    if (!stockCode) throw new ApplicationError(400, '해당 code와 매핑되는 종목이 존재하지 않음');

    const stockBalanace = await stockBalanaceRepository.findOne({
        where: { account: { id: user.account.id }, code: { krxCode: stockCode.krxCode } },
    });

    if (!stockBalanace || stockBalanace!.amount < amount) {
        console.log('부족');
        throw new ApplicationError(400, '잔고부족');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // 거래 기록 생성
        const stockTransaction = await queryRunner.manager.getRepository(StockTransaction).save({
            user: user,
            code: stockCode,
            amount: amount,
            price: price,
        });

        // 주식 잔고 처리
        if (stockBalanace!.amount === amount) {
            await queryRunner.manager.getRepository(StockBalance).remove(stockBalanace!);
        } else {
            await queryRunner.manager.getRepository(StockBalance).update(stockBalanace!.id, {
                amount: () => `amount - ${amount}`,
            });
            stockBalanace!.amount -= amount;
        }

        // 내 잔고 처리
        await queryRunner.manager.getRepository(Account).update(user.account.id, {
            amount: () => `amount + ${amount * price}`,
        });
        user.account.amount += amount * price;

        await queryRunner.commitTransaction();
        return {
            user: {
                email: userEmail,
                account: user.account,
            },
            amount: amount,
            price: stockBalanace?.avg,
            code: stockCode,
            date: stockTransaction.createdAt,
        };
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new ApplicationError(500, 'Rollback');
    } finally {
        await queryRunner.release();
    }
};
