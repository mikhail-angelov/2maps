import {MigrationInterface, QueryRunner} from "typeorm";

export class jeoJson1677570677518 implements MigrationInterface {
    name = 'jeoJson1677570677518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "track" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying NOT NULL DEFAULT '', "geo_json" text NOT NULL, "image" bytea, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_0631b9bcf521f8fab3a15f2c37e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "track" ADD CONSTRAINT "FK_7a53190ce0ee143164ae26025d7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "track" DROP CONSTRAINT "FK_7a53190ce0ee143164ae26025d7"`);
        await queryRunner.query(`DROP TABLE "track"`);
    }

}
