import { Entity, Index, Column, PrimaryColumn } from "typeorm";

@Entity('tiles')
@Index(["z", "y","x"], { unique: true })
export class EtoMesto {

    @Column()
    x!: number;

    @Column()
    y!: number;

    @Column()
    z!: number;

    @PrimaryColumn()
    s!: number;

    @Column()
    image!: Buffer;

}