import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Point } from 'geojson';
import { ColumnEx } from 'nestjs-db-unit'
import { User } from "./user";

@Entity({ name: 'mark' })
export class Mark {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    userId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    rate?: number;

    @ColumnEx({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    location!: Point;

    @ColumnEx({ type: 'timestamptz' })
    timestamp!: Date;
}