import { QueryRunner } from 'typeorm';

export interface IService {
    queryRunner: QueryRunner;
    name: string;
    setQueryRunner(queryRunner: QueryRunner): void;
}
