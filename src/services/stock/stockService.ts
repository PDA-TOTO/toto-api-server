import { AppDataSource } from '../../dbs/main/dataSource';
import CODE from '../../dbs/main/entities/codeEntity';
import dotenv from 'dotenv';
import Finance from '../../dbs/main/entities/financeEntity';
import ApplicationError from '../../utils/error/applicationError';
import Price from '../../dbs/main/entities/priceEntity';
dotenv.config();

const stockRepository = AppDataSource.getRepository(CODE);
const financeRepository = AppDataSource.getRepository(Finance);
const priceRepository = AppDataSource.getRepository(Price);

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
