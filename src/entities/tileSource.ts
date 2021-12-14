import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({name:'tile_source'})
export class TileSource {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({unique: true})
    name!: string;
    
    @Column({unique: true})
    key!: string;
    
    @Column()
    description!: string;
}