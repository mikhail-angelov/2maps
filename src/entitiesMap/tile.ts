import { Entity, Index, Column, PrimaryColumn, Generated } from "typeorm";

@Entity('tiles')
@Index(["z", "y","x"])
export class Tile {

    @PrimaryColumn()
    x!: number;

    @PrimaryColumn()
    y!: number;

    @PrimaryColumn()
    z!: number;

    @Generated()
    s!: number;

    @Column()
    image!: Buffer;

}