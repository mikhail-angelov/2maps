import { Entity, Index, Column, PrimaryGeneratedColumn,UpdateDateColumn } from "typeorm";

@Entity('wiki')
@Index(["z", "y", "x"])
export class WikiTile {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @UpdateDateColumn({ name: 'updated_at' })
    timestamp!: Date;

    @Column()
    version!: number;

    @Column()
    x!: number;

    @Column()
    y!: number;

    @Column()
    z!: number;

    @Column({type: "blob", nullable: false})
    image!: Buffer;
}