import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ColumnEx } from 'nestjs-db-unit'
import { User } from "./user";

@Entity({ name: 'track' })
export class Track {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    userId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @Column({default:''})
    name!: string;

    @Column("simple-json")
    track!: string;

    @ColumnEx({type: "bytea", nullable: true})
    image?: Buffer;

    @ColumnEx({ type: 'timestamptz' })
    timestamp!: Date;
}