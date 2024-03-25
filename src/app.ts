import "reflect-metadata";
import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { AppDataSource } from "./dbs/main/dataSource";
import errorHandler from "./middlewares/errorHandler/errorHandler";
import userRouter from "./routers/userRouter";
import stockRouter from "./routers/stockRouter";
import ApplicationError from "./utils/error/applicationError";

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/users", userRouter);
app.use("/api/stocks", stockRouter);
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new ApplicationError(404, `Can't find ${req.originalUrl} on server`));
});

app.use(errorHandler);

// Main DB Connection
AppDataSource.initialize().then(() => console.log("Main DB Connected!"));

const SERVER_PORT = process.env.SERVER_PORT;
app.listen(SERVER_PORT, () => {
  console.log(`Server Start: Listening Port on ${SERVER_PORT}`);
});
