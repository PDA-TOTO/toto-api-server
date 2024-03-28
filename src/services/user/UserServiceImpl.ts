import { Repository, QueryRunner } from 'typeorm';
import User from '../../dbs/main/entities/userEntity';
import { AccountResponse, IBalanceService } from '../balance/IBalanceService';
import { IUserService, VisibleUserResponse } from './IUserService';
import { BalanceService } from '../balance/BalanceServiceImpl';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Transaction } from '../transaction';
import ApplicationError from '../../utils/error/applicationError';

dotenv.config();

export class UserService implements IUserService {
    name: string = 'UserService';
    userRepository: Repository<User>;
    balanceService: IBalanceService;
    queryRunner: QueryRunner;

    constructor(queryRunner: QueryRunner) {
        this.setQueryRunner(queryRunner);
    }

    setQueryRunner(queryRunner: QueryRunner): void {
        this.queryRunner = queryRunner;
        this.userRepository = queryRunner.manager.getRepository(User);

        if (!this.queryRunner.instances) {
            this.queryRunner.instances = [];
        }

        this.queryRunner.instances.push(this.name);
        if (this.queryRunner.instances.includes(BalanceService.name)) {
            return;
        }
        this.balanceService = new BalanceService(queryRunner);
    }

    @Transaction()
    async isExistByEmail(email: string): Promise<boolean> {
        return await this.userRepository.existsBy({ email: email });
    }

    @Transaction()
    async emailSignUp(email: string, password: string): Promise<VisibleUserResponse> {
        if (await this.isExistByEmail(email)) {
            throw new ApplicationError(400, '이미 사용 중인 이메일');
        }

        // hashing
        const saltRound: number = Number(process.env.SALT_ROUND);
        const salt = await bcrypt.genSalt(saltRound);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user: User = await this.userRepository.save({ email: email, password: hashedPassword });

        const account: AccountResponse = await this.balanceService.createAccount(user);

        return this.mapToVisibleUser(user, account);
    }

    @Transaction()
    async logIn(email: string, password: string): Promise<VisibleUserResponse> {
        const user = await this.findByEmail(email);

        if (!user) {
            throw new ApplicationError(400, '이메일이 존재하지 않습니다.');
        }

        try {
            const auth = await bcrypt.compare(password, user.password);
            if (auth) {
                return this.mapToVisibleUser(user);
            } else {
                throw new ApplicationError(400, '비밀번호가 일치하지 않습니다.');
            }
        } catch (err) {
            throw new ApplicationError(400, '비밀버호가 일치하지 않습니다.');
        }
    }

    @Transaction()
    async updateTendency(email: string, point: number): Promise<string> {
        if (point <= 20) {
            await this.userRepository.update({ email: email }, { tendency: 1 });
            return '안정형';
        } else if (point <= 40) {
            await this.userRepository.update({ email: email }, { tendency: 2 });
            return '안정추구형';
        } else if (point <= 60) {
            await this.userRepository.update({ email: email }, { tendency: 3 });
            return '위험중립형';
        } else if (point <= 80) {
            await this.userRepository.update({ email: email }, { tendency: 4 });
            return '적극투자형';
        } else {
            await this.userRepository.update({ email: email }, { tendency: 5 });
            return '공격투자형';
        }
    }

    @Transaction()
    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { email: email },
            relations: {
                account: true,
            },
        });
    }

    mapToVisibleUser = (user: User, account?: AccountResponse): VisibleUserResponse => {
        let visibleUser: VisibleUserResponse = {
            id: user.id,
            account: user.account,
            experience: user.experience,
            email: user.email,
            tendency: user.tendency,
            createdAt: user.createdAt,
        };

        if (!account) {
            return visibleUser;
        }

        return {
            ...visibleUser,
            account: account,
        };
    };
}
