import { AppDataSource } from '../dbs/main/dataSource';
import { IService } from './IService';

export const Transaction = () => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let originalMethod = descriptor.value;

        descriptor.value = async function (...args: any) {
            const s = this as IService;

            if (s.queryRunner.isTransactionActive) {
                return await originalMethod.apply(this, args);
            }

            try {
                await s.queryRunner.connect();
                await s.queryRunner.startTransaction();

                const result = await originalMethod.apply(this, args);

                await s.queryRunner.commitTransaction();

                return result;
            } catch (err) {
                await s.queryRunner.rollbackTransaction();
                throw err;
            } finally {
                await s.queryRunner.release();

                let queryRunner = AppDataSource.createQueryRunner();
                queryRunner.instances = new Map<string, IService>();
                s.setQueryRunner(queryRunner);
            }
        };
    };
};
