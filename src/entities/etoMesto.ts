import { Entity, Index, Column, PrimaryColumn } from "typeorm";

@Entity('tiles')
@Index(["z", "y","x"], { unique: true })
export class EtoMesto {

    @PrimaryColumn()
    x!: number;

    @Column()
    y!: number;

    @Column()
    z!: number;

    @Column()
    s!: number;

    @Column({ name: 'Image' })
    image!: Buffer;

}