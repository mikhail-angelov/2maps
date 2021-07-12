import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity('tiles')
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