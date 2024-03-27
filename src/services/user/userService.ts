import { AppDataSource } from '../../dbs/main/dataSource';
import User from '../../dbs/main/entities/userEntity';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { VisibleUser } from './userServiceReturnType';
import ApplicationError from '../../utils/error/applicationError';
import Account from '../../dbs/main/entities/accountEntity';

dotenv.config();

const userRepository = AppDataSource.getRepository(User);
const accountRepository = AppDataSource.getRepository(Account);

// 계좌 번호를 랜덤으로 생성하는 함수
const generateAccountNumber = () => {
    const accountNumberLength = 11; // 계좌 번호의 길이를 설정
    const characters = '0123456789'; // 계좌 번호에 포함될 문자열
    let accountNumber = '100-';
    for (let i = 0; i < accountNumberLength + 1; i++) {
        if (i === 7) {
            accountNumber += '-';
        } else {
            const randomIndex = Math.floor(Math.random() * characters.length);
            accountNumber += characters[randomIndex];
        }
    }
    return accountNumber;
};

export const userIsExistByEmail = async (email: string): Promise<boolean> => {
    return await userRepository.existsBy({ email: email });
};

const mapToVisibleUser = (user: User): VisibleUser => {
    return {
        id: user.id,
        account: user.account,
        experience: user.experience,
        email: user.email,
        tendency: user.tendency,
        createdAt: user.createdAt,
    };
};

//SignUp
export const emailSignUp = async (email: string, password: string): Promise<VisibleUser> => {
    // hashing
    const saltRound: number = Number(process.env.SALT_ROUND);
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPassword = await bcrypt.hash(password, salt);
    const account = generateAccountNumber();

    const newAccount = new Account();
    newAccount.account = account;
    newAccount.amount = 10000000;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const accountOBJ = await queryRunner.manager.getRepository(Account).save(newAccount);

        const user = await queryRunner.manager
            .getRepository(User)
            .save({ email: email, password: hashedPassword, account: accountOBJ });

        return mapToVisibleUser(user);
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new ApplicationError(500, 'RollBack');
    } finally {
        queryRunner.release();
    }
};

//LogIn
export const logIn = async (email: string, password: string): Promise<VisibleUser> => {
    // hashing
    const user = await userRepository.findOne({
        where: {
            email: email,
        },
        relations: {
            account: true,
        },
    });
    try {
        if (user) {
            const auth = await bcrypt.compare(password, user.password);

            if (auth) {
                return mapToVisibleUser(user);
            } else {
                throw new ApplicationError(400, '비밀번호가 일치하지 않습니다.');
            }
        } else {
            throw new ApplicationError(400, '이메일이 존재하지 않습니다.');
        }
    } catch (error) {
        throw error;
    }
};

//Update Investment Tendency
export const updateTendency = async (email: string, point: number): Promise<string> => {
    if (point <= 20) {
        userRepository.update({ email: email }, { tendency: 1 });
        return '안정형';
    } else if (point <= 40) {
        userRepository.update({ email: email }, { tendency: 2 });
        return '안정추구형';
    } else if (point <= 60) {
        userRepository.update({ email: email }, { tendency: 3 });
        return '위험중립형';
    } else if (point <= 80) {
        userRepository.update({ email: email }, { tendency: 4 });
        return '적극투자형';
    } else {
        userRepository.update({ email: email }, { tendency: 5 });
        return '공격투자형';
    }
};

export const getMyInfo = async (email: string): Promise<VisibleUser | null> => {
    const user = await userRepository.findOne({
        where: {
            email: email,
        },
        relations: {
            account: true,
        },
    });

    if (user) return mapToVisibleUser(user);
    else return null;
};

export const userFindByEmail = async (email: string) => {
    const user = await userRepository.findOne({ where: { email: email }, relations: { account: true } });
    return user;
};
