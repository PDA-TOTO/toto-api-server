import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

const isProd: boolean = process.env.NODE_ENV === "PROD";

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: isProd ? process.env.MAIN_DB_HOST : 'localhost', //DB HOST
    port: isProd ? Number(process.env.MAIN_DB_PORT) : 3312, // DB 포트 mysql default port는 3306
    username: isProd ? process.env.MAIN_DB_USERNAME : 'root', // DB 접속시 계정
    password: isProd ? process.env.MAIN_DB_PASSWORD : 'root', // DB 접속시 비밀번호
    database: isProd ? process.env.MAIN_DB_NAME : 'toto', // DB내 사용하는 DATABASE
    synchronize: !isProd, // 엔티티 동기화 여부, 개발 중일땐 true를 해도 상관없으나 실서버에서는 false로 하고 migration을 하거나, 직접 수정한다.
    // logging: true,
    entities: [__dirname + '/entities/*'],
    subscribers: [],
    migrations: [],
});
