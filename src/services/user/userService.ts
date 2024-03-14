import { AppDataSource } from '../../dbs/main/dataSource';
import User from '../../dbs/main/entities/userEntity';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { VisibleUser } from './userServiceReturnType';
dotenv.config();

const userRepository = AppDataSource.getRepository(User);

export const emailSignUp = async (email: string, password: string): Promise<VisibleUser> => {
    // hashing
    const saltRound: number = Number(process.env.SALT_ROUND);
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.save({ email: email, password: hashedPassword });

    return mapToVisibleUser(user);
};

export const userIsExistByEmail = async (email: string): Promise<boolean> => {
    return await userRepository.existsBy({ email: email });
};

const mapToVisibleUser = (user: User): VisibleUser => {
    return {
        id: user.id,
        email: user.email,
        exp: user.exp,
        createdAt: user.createdAt,
    };
};
