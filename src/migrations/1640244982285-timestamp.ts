import {MigrationInterface, QueryRunner} from "typeorm";

export class timestamp1640244982285 implements MigrationInterface {
    name = 'timestamp1640244982285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mark" DROP COLUMN "timestamp"`);
        await queryRunner.query(`ALTER TABLE "mark" ADD "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mark" DROP COLUMN "timestamp"`);
        await queryRunner.query(`ALTER TABLE "mark" ADD "timestamp" integer NOT NULL`);
    }

}
