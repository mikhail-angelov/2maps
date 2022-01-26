import { Entity, Index, Column, PrimaryColumn, Generated } from "typeorm";

@Entity('tiles')
@Index(["z", "y","x"])
export class Tile {

    @Column()
    x!: number;

    @Column()
    y!: number;

    @Column()
    z!: number;

    @PrimaryColumn()
    @Generated()
    s!: number;

    @Column()
    image!: Buffer;

}