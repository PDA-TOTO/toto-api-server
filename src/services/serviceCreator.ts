import { QueryRunner } from 'typeorm';
import { IService } from './IService';
import { UserService } from './user/UserServiceImpl';
import { StockService } from './stock/StockServiceImpl';
import { PortfolioService } from './portfolio/PortfolioServiceImpl';
import { BalanceService } from './balance/BalanceServiceImpl';
import { CommunityService } from './community/CommunityServiceImpl';

export function createService(
    queryRunner: QueryRunner,
    serviceName: string,
    parent: IService,
    parentName: string
): IService {
    if (!queryRunner.instances) {
        queryRunner.instances = new Map<string, IService>();
    }

    if (!queryRunner.instances.has(parentName)) {
        queryRunner.instances.set(parentName, parent);
    }

    if (queryRunner.instances.has(serviceName)) {
        // console.log(`get ---> ${serviceName}`);
        return queryRunner.instances.get(serviceName) as IService;
    }

    // console.log(`create ---> ${serviceName}`);
    switch (serviceName) {
        case UserService.name:
            return new UserService(queryRunner);
        case StockService.name:
            return new StockService(queryRunner);
        case PortfolioService.name:
            return new PortfolioService(queryRunner);
        case BalanceService.name:
            return new BalanceService(queryRunner);
        case CommunityService.name:
            return new CommunityService(queryRunner);
        default:
            throw new Error(`${serviceName} is not enroll at factory`);
    }
}
