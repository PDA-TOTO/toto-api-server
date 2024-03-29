import { Repository } from 'typeorm';
import User from '../../dbs/main/entities/userEntity';
import { IService } from '../IService';
import { AccountResponse, IBalanceService } from '../balance/IBalanceService';
import { IPortfolioService } from '../portfolio/IPortfolioService';

export type VisibleUserResponse = {
    id: number;
    email: string;
    experience: number;
    tendency: number | null;
    createdAt: Date;
    account: AccountResponse;
};

export interface IUserService extends IService {
    userRepository: Repository<User>;
    balanceService: IBalanceService;
    portfolioService: IPortfolioService;

    isExistByEmail(email: string): Promise<boolean>;
    emailSignUp(email: string, password: string): Promise<VisibleUserResponse>;
    logIn(email: string, password: string): Promise<VisibleUserResponse>;
    updateTendency(email: string, point: number): Promise<string>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
}
