import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity('info')
export class Info {

    @Column()
    minzoom!: number;
    @PrimaryColumn()
    maxzoom!: number;

}