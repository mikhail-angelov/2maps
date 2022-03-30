import { Entity, Index, Column, PrimaryGeneratedColumn } from "typeorm";
import { UpdateDateColumnEx, ColumnEx } from 'nestjs-db-unit'

@Entity('wiki')
@Index(["z", "y", "x"])
export class WikiTile {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @UpdateDateColumnEx({ name: 'updated_at', type: 'timestamptz' })
    timestamp!: Date;

    @Column()
    version!: number;

    @Column()
    x!: number;

    @Column()
    y!: number;

    @Column()
    z!: number;

    @ColumnEx({type: "bytea", nullable: false})
    image!: Buffer;
}