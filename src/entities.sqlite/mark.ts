import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Point } from 'geojson';
import { User } from "./user";
import { use } from "chai";

@Entity({ name: 'mark' })
export class Mark {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    userId!: string;

    @ManyToOne(() => User, user => user.marks)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    rate?: number;
    
    @Column()
    lat!: number;
    
    @Column()
    lng!: number;

    @Column()
    timestamp!: Date;
}