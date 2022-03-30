import {MigrationInterface, QueryRunner} from "typeorm";

export class addWiki1648628834682 implements MigrationInterface {
    name = 'addWiki1648628834682'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wiki" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "z" integer NOT NULL, "image" bytea NOT NULL, CONSTRAINT "PK_c021a14e8072245b6d24f069ace" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_948964485b245a9961c6b332b0" ON "wiki" ("z", "y", "x") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_948964485b245a9961c6b332b0"`);
        await queryRunner.query(`DROP TABLE "wiki"`);
    }

}
