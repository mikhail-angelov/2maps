import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { MapType } from "./enums";

@Entity({ name: 'map_file' })
export class MapFile {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    url!: string;

    @Column({ default: 0 })
    size!: number;

    @Column({ default: 0 })
    price!: number;

    @Column({ type: 'simple-enum', enum: MapType, nullable: true, default: MapType.public })
    type!: MapType;
}