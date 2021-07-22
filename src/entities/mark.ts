import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({})
export class Mark {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    userId!: string;

    @Column()
    name!: string;

    @Column()
    description?: string;

    @Column()
    lat!: number;

    @Column()
    lng!: number;
    
    @Column()
    timestamp!: number;
}