import {MigrationInterface, QueryRunner} from "typeorm";

export class addTrip1659626638074 implements MigrationInterface {
    name = 'addTrip1659626638074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "trip" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "user_id" uuid NOT NULL, "marks" character varying, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_714c23d558208081dbccb9d9268" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "trip" ADD CONSTRAINT "FK_64c0a95b91a9b4c120a26d54b69" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trip" DROP CONSTRAINT "FK_64c0a95b91a9b4c120a26d54b69"`);
        await queryRunner.query(`DROP TABLE "trip"`);
    }

}
