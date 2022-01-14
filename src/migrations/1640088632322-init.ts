import {MigrationInterface, QueryRunner} from "typeorm";

export class init1640088632322 implements MigrationInterface {
    name = 'init1640088632322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);
        await queryRunner.query(`CREATE TABLE "map_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, "size" integer NOT NULL DEFAULT '0', "price" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_23472a30adc793fa05d04713f7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "reset_token" character varying, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mark" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying NOT NULL, "description" character varying, "rate" integer, "lat" integer NOT NULL, "lng" integer NOT NULL, "timestamp" integer NOT NULL, CONSTRAINT "PK_0c6d4afd73cc2b4eee5a926aafc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tile_source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "key" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_38127525b84e1180fe1a0910024" UNIQUE ("name"), CONSTRAINT "UQ_5508c7ee116daf5ce7b78d43254" UNIQUE ("key"), CONSTRAINT "PK_d2e1064d6ec7d66b1bbc6169109" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mark" ADD CONSTRAINT "FK_f5ac5099aa5d986f0926e54c035" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mark" DROP CONSTRAINT "FK_f5ac5099aa5d986f0926e54c035"`);
        await queryRunner.query(`DROP TABLE "tile_source"`);
        await queryRunner.query(`DROP TABLE "mark"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "map_file"`);
    }

}
