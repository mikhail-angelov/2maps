import { Entity, Index, Column, PrimaryColumn } from "typeorm";

@Entity('tiles')
@Index(["zoomLevel", "tileColumn","tileRow"], { unique: true })
export class MbTile {

    @PrimaryColumn({name:'zoom_level'})
    zoomLevel!: number;

    @Column({name:'tile_column'})
    tileColumn!: number;

    @Column({name:'tile_row'})
    tileRow!: number;
    
    @Column({name:'tile_data'})
    tileData!: Buffer;

}