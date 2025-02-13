import { MigrationInterface, QueryRunner } from "typeorm";

export class Generated1739285638500 implements MigrationInterface {
    name = 'Generated1739285638500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mark" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL, "description" varchar, "rate" integer, "lat" integer NOT NULL, "lng" integer NOT NULL, "timestamp" datetime NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "reset_token" varchar, "role" varchar CHECK( "role" IN ('admin','user','test') ) NOT NULL DEFAULT ('user'))`);
        await queryRunner.query(`CREATE TABLE "track" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL DEFAULT (''), "geo_json" text NOT NULL, "image" blob, "timestamp" datetime NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "tile_source" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "key" varchar NOT NULL, "description" varchar NOT NULL, CONSTRAINT "UQ_38127525b84e1180fe1a0910024" UNIQUE ("name"), CONSTRAINT "UQ_5508c7ee116daf5ce7b78d43254" UNIQUE ("key"))`);
        await queryRunner.query(`CREATE TABLE "wiki" ("id" varchar PRIMARY KEY NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "version" integer NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "z" integer NOT NULL, "image" blob NOT NULL)`);
        await queryRunner.query(`CREATE INDEX "IDX_948964485b245a9961c6b332b0" ON "wiki" ("z", "y", "x") `);
        await queryRunner.query(`CREATE TABLE "map_file" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "url" varchar NOT NULL, "size" integer NOT NULL DEFAULT (0), "price" integer NOT NULL DEFAULT (0), "type" varchar CHECK( "type" IN ('public','test','admin') ) DEFAULT ('public'))`);
        await queryRunner.query(`CREATE TABLE "temporary_mark" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL, "description" varchar, "rate" integer, "lat" integer NOT NULL, "lng" integer NOT NULL, "timestamp" datetime NOT NULL, CONSTRAINT "FK_f5ac5099aa5d986f0926e54c035" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_mark"("id", "user_id", "name", "description", "rate", "lat", "lng", "timestamp") SELECT "id", "user_id", "name", "description", "rate", "lat", "lng", "timestamp" FROM "mark"`);
        await queryRunner.query(`DROP TABLE "mark"`);
        await queryRunner.query(`ALTER TABLE "temporary_mark" RENAME TO "mark"`);
        await queryRunner.query(`CREATE TABLE "temporary_track" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL DEFAULT (''), "geo_json" text NOT NULL, "image" blob, "timestamp" datetime NOT NULL, CONSTRAINT "FK_7a53190ce0ee143164ae26025d7" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_track"("id", "user_id", "name", "geo_json", "image", "timestamp") SELECT "id", "user_id", "name", "geo_json", "image", "timestamp" FROM "track"`);
        await queryRunner.query(`DROP TABLE "track"`);
        await queryRunner.query(`ALTER TABLE "temporary_track" RENAME TO "track"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "track" RENAME TO "temporary_track"`);
        await queryRunner.query(`CREATE TABLE "track" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL DEFAULT (''), "geo_json" text NOT NULL, "image" blob, "timestamp" datetime NOT NULL)`);
        await queryRunner.query(`INSERT INTO "track"("id", "user_id", "name", "geo_json", "image", "timestamp") SELECT "id", "user_id", "name", "geo_json", "image", "timestamp" FROM "temporary_track"`);
        await queryRunner.query(`DROP TABLE "temporary_track"`);
        await queryRunner.query(`ALTER TABLE "mark" RENAME TO "temporary_mark"`);
        await queryRunner.query(`CREATE TABLE "mark" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "name" varchar NOT NULL, "description" varchar, "rate" integer, "lat" integer NOT NULL, "lng" integer NOT NULL, "timestamp" datetime NOT NULL)`);
        await queryRunner.query(`INSERT INTO "mark"("id", "user_id", "name", "description", "rate", "lat", "lng", "timestamp") SELECT "id", "user_id", "name", "description", "rate", "lat", "lng", "timestamp" FROM "temporary_mark"`);
        await queryRunner.query(`DROP TABLE "temporary_mark"`);
        await queryRunner.query(`DROP TABLE "map_file"`);
        await queryRunner.query(`DROP INDEX "IDX_948964485b245a9961c6b332b0"`);
        await queryRunner.query(`DROP TABLE "wiki"`);
        await queryRunner.query(`DROP TABLE "tile_source"`);
        await queryRunner.query(`DROP TABLE "track"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "mark"`);
    }

}
