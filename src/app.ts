import 'reflect-metadata';
import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { AppDataSource } from './dbs/main/dataSource';
import errorHandler from './middlewares/errorHandler/errorHandler';
import ApplicationError from './utils/error/applicationError';
import cookieParser = require('cookie-parser');

dotenv.config();

import userRouter from './routers/userRouter';
import stockRouter from './routers/stockRouter';
import portfolioRouter from './routers/portfolioRouter';
import communityRouter from './routers/communityRouter';
import quizRouter from './routers/quizRouter';
import commentRouter from './routers/commentRouter';

import { VisibleUser } from './services/user/userServiceReturnType';
import { IService } from './services/IService';

const app: Express = express();

declare global {
    namespace Express {
        interface Request {
            user?: VisibleUser;
        }
    }
}

declare module 'typeorm' {
    interface QueryRunner {
        instances: Map<string, IService>;
    }
}

// Main DB Connection
AppDataSource.initialize().then(() => console.log('Main DB Connected!'));

const origin = process.env.ORIGIN;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: origin,
        credentials: true,
    })
);

app.use('/api/users', userRouter);
app.use('/api/portfolios', portfolioRouter);
app.use('/api/stocks', stockRouter);
app.use('/api/community', communityRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/comment', commentRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new ApplicationError(404, `Can't find ${req.originalUrl} on server`));
});

app.use(errorHandler);

const SERVER_PORT = process.env.SERVER_PORT;
app.listen(SERVER_PORT, () => {
    console.log(`Server Start: Listening Port on ${SERVER_PORT}`);
});
