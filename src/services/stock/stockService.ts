import { AppDataSource } from '../../dbs/main/dataSource';
import CODE from '../../dbs/main/entities/codeEntity';
import dotenv from 'dotenv';
import ApplicationError from '../../utils/error/applicationError';
dotenv.config();

const stockRepository = AppDataSource.getRepository(CODE);

export const showStocks =  async () => {
    // hashing
    const user = await stockRepository.find();
    return user
};