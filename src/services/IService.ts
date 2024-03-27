import { QueryRunner } from 'typeorm';

export interface IService {
    queryRunner: QueryRunner;
    setQueryRunner(queryRunner: QueryRunner): void;
}
