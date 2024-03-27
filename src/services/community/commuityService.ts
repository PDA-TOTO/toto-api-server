import { AppDataSource } from "../../dbs/main/dataSource";
import Community from "../../dbs/main/entities/communityEntity";
import CODE from "../../dbs/main/entities/codeEntity";
import dotenv from "dotenv";
dotenv.config();

const communityRepository = AppDataSource.getRepository(Community);
const stockRepository = AppDataSource.getRepository(CODE);

const stockFindByCode = async (code: string) => {
  return await stockRepository.findOneBy({ krxCode: code });
};

export const getCommunityFindByKrxCode = async (code: string) => {
  const stockCode: CODE | null = await stockFindByCode(code);
  if (stockCode) {
    return await communityRepository.find({
      where: { code: stockCode },
    });
  } else {
    return [];
  }
};
