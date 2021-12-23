import {MigrationInterface, QueryRunner} from "typeorm";

export class latLngUpdate1640178159435 implements MigrationInterface {
    name = 'latLngUpdate1640178159435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE from "mark"`);
        await queryRunner.query(`ALTER TABLE "mark" DROP COLUMN "lat"`);
        await queryRunner.query(`ALTER TABLE "mark" DROP COLUMN "lng"`);
        await queryRunner.query(`ALTER TABLE "mark" ADD "location" geography(Point,4326) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mark" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "mark" ADD "lng" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mark" ADD "lat" integer NOT NULL`);
    }

}
