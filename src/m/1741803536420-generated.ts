import { MigrationInterface, QueryRunner } from "typeorm";

export class Generated1741803536420 implements MigrationInterface {
    name = 'Generated1741803536420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_mark" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL, "description" varchar, "rate" integer, "lat" real NOT NULL, "lng" real NOT NULL, "timestamp" datetime NOT NULL, CONSTRAINT "FK_f5ac5099aa5d986f0926e54c035" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_mark"("id", "user_id", "name", "description", "rate", "lat", "lng", "timestamp") SELECT "id", "user_id", "name", "description", "rate", "lat", "lng", "timestamp" FROM "mark"`);
        await queryRunner.query(`DROP TABLE "mark"`);
        await queryRunner.query(`ALTER TABLE "temporary_mark" RENAME TO "mark"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mark" RENAME TO "temporary_mark"`);
        await queryRunner.query(`CREATE TABLE "mark" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL, "description" varchar, "rate" integer, "lat" integer NOT NULL, "lng" integer NOT NULL, "timestamp" datetime NOT NULL, CONSTRAINT "FK_f5ac5099aa5d986f0926e54c035" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "mark"("id", "user_id", "name", "description", "rate", "lat", "lng", "timestamp") SELECT "id", "user_id", "name", "description", "rate", "lat", "lng", "timestamp" FROM "temporary_mark"`);
        await queryRunner.query(`DROP TABLE "temporary_mark"`);
    }

}
