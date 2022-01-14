import {MigrationInterface, QueryRunner} from "typeorm";

export class mapFileAttribute1642153740703 implements MigrationInterface {
    name = 'mapFileAttribute1642153740703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "map_file_type_enum" AS ENUM('public', 'test', 'admin')`);
        await queryRunner.query(`ALTER TABLE "map_file" ADD "type" "map_file_type_enum" DEFAULT 'public'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "map_file" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "map_file_type_enum"`);
    }

}
