import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { ColumnEx } from 'nestjs-db-unit'
import { User } from "./user";

@Entity({ name: 'trip' })
export class Trip {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ name: 'user_id' })
    userId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @Column({ name: 'marks', nullable: true })
    marks?: string;

    @ColumnEx({ type: 'timestamptz' })
    timestamp!: Date;
}