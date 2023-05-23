import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
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

    @Column({type: "simple-json", name:'geo_json'})
    geoJson!: string;

    @Column({type: "bytea", nullable: true})
    image?: Buffer;

    @Column({ type: 'timestamptz' })
    timestamp!: Date;
}