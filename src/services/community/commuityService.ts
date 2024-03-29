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

export const setInitialCommunity = async (code: string) => {
  const stockCode: CODE | null = await stockFindByCode(code);
  try {
    if (stockCode) {
      const currentDate = new Date();
      const oneWeekLater = currentDate.getTime() + 7 * 24 * 60 * 60 * 1000;
      const oneWeekLaterDate = new Date(oneWeekLater);
      const data = await communityRepository.save({
        code: stockCode,
        voteTitle: `${stockCode.name}, 오를까?`,
        yesCount: 0,
        noCount: 0,
        startDate: currentDate,
        endDate: oneWeekLaterDate,
      });
    }
  } catch (error) {
    console.log("error:", error);
  }
};

export const getCommunityFindByKrxCode = async (code: string) => {
  const stockCode: CODE | null = await stockFindByCode(code);
  if (stockCode) {
    let communityData = await communityRepository.find({
      where: { code: stockCode },
    });
    if (communityData.length === 0) {
      await setInitialCommunity(code);
      communityData = await getCommunityFindByKrxCode(code);
    }
    return communityData;
  } else {
    return [];
  }
};

// export const submitVote = async (
//   code: string,
//   vote: boolean, // 찬성 true, 반대 false
//   first: boolean // 첫 투표 true, 두 번째부터 false
// ) => {
//   const stockCode: CODE | null = await stockFindByCode(code);
//   if (stockCode) {
//     const communityData = await communityRepository.find({
//       where: { code: stockCode },
//     });
//     const yesCount = communityData[0].yesCount;
//     const noCount = communityData[0].noCount;
//     if (vote) {
//       communityRepository.update(
//         { code: stockCode },
//         { yesCount: yesCount + 1 }
//       );
//       if (!first) {
//         communityRepository.update(
//           { code: stockCode },
//           { noCount: noCount - 1 }
//         );
//       }
//     } else if (!vote) {
//       communityRepository.update({ code: stockCode }, { noCount: noCount + 1 });
//       if (!first) {
//         communityRepository.update(
//           { code: stockCode },
//           { yesCount: yesCount - 1 }
//         );
//       }
//     }
//   }
// };
