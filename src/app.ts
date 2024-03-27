<<<<<<< HEAD
import 'reflect-metadata';
import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { AppDataSource } from './dbs/main/dataSource';
import errorHandler from './middlewares/errorHandler/errorHandler';
import userRouter from './routers/userRouter';
import ApplicationError from './utils/error/applicationError';
import stokRouter from "./routers/stockRouter";
import portfolioRouter from "./routers/portfolioRouter"
=======
import "reflect-metadata";
import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { AppDataSource } from "./dbs/main/dataSource";
import errorHandler from "./middlewares/errorHandler/errorHandler";
import userRouter from "./routers/userRouter";
import communityRouter from "./routers/communityRouter";
import ApplicationError from "./utils/error/applicationError";
import cookieParser = require("cookie-parser");

dotenv.config();
import stokRouter from './routers/stockRouter';
import { VisibleUser } from './services/user/userServiceReturnType';
>>>>>>> 25630ee88f96ebb976ed2881648ce6ae4f261fe5

const app: Express = express();

declare global {
    namespace Express {
        interface Request {
            user?: VisibleUser;
        }
    }
}

// Main DB Connection
AppDataSource.initialize().then(() => console.log("Main DB Connected!"));

const SERVER_PORT = process.env.SERVER_PORT;
app.listen(SERVER_PORT, () => {
  console.log(`Server Start: Listening Port on ${SERVER_PORT}`);
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);

<<<<<<< HEAD
app.use('/api/users', userRouter);
app.use('/api/stocks', stokRouter);
app.use('/api/portfolios', portfolioRouter);
=======
app.use("/api/users", userRouter);
app.use("/api/stocks", stockRouter);
app.use("/api/community", communityRouter);
>>>>>>> 25630ee88f96ebb976ed2881648ce6ae4f261fe5

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new ApplicationError(404, `Can't find ${req.originalUrl} on server`));
});

app.use(errorHandler);
