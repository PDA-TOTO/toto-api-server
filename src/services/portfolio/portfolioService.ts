import { AppDataSource } from '../../dbs/main/dataSource';
import dotenv from 'dotenv';
import ApplicationError from '../../utils/error/applicationError';
import PORTFOILIOITEMS from '../../dbs/main/entities/PortfolioItemsEntity';
import PORTFOILIO from '../../dbs/main/entities/PortfolioEntity';
import User from '../../dbs/main/entities/userEntity';
import CODE from '../../dbs/main/entities/codeEntity';
// import { stocksGetAllByCode } from '../stock/stockService';

// dotenv.config();

// const portfolioItemsRepository = AppDataSource.getRepository(PORTFOILIOITEMS);
// const portfolioRepository = AppDataSource.getRepository(PORTFOILIO);

// type PortFolioItemITEMS = {
//     krxCode: string;
//     code: string;
//     stock: string;
//     weight: Number;
// };

// 역할, 업데이트하고 없으면 생성
// export const updatePortfolio = async (
//     userEmail: string,
//     portId: number,
//     portName: string,
//     items: PortFolioItemITEMS[]
// ) => {};

// export const getPortNames = async (user: User | null) => {
//     // console.log(user)
//     return await portfolioRepository.find({ where: { user: { id: user!.id } } });
// };

// export const createPortfolio = async (user: User, portName: string, items: PortFolioItemITEMS[]) => {
//이메일을 가지고 있는 USER객체 반환(id, email, passwird, exp 등등)
// const user:User|null = await userFindByEmail(userEmail);
// if (!user) throw new ApplicationError(400, '유저가 존재하지 않습니다.');
//items 안에 stock있으면 그거 이름에 따른 CODE객체들 준다
// const codes: CODE[] = await stocksGetAllByCode(items.map((i) => i.code));
// const ktUser = new User(); //깡동유저라는 뜻
// ktUser.id = user.id;
// ktUser.email = user.email;
// console.log(ktUser);
// const portfolio: PORTFOILIO = await portfolioRepository.save({ user: ktUser, portName: portName });
// for (let i = 0; i < codes.length; i++) {
//     const result = await portfolioItemsRepository.save({
//         krxCode: codes[i],
//         portId: portfolio.id,
//         weight: items[i].weight,
//         stock: items[i].stock,
//     });
//     // console.log(result)
// }
// };
