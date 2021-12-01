import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({name:'map_file'})
export class MapFile {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;
    
    @Column()
    url!: string;
    
    @Column({default:0})
    size!: number;

    @Column({default:0})
    price!: number;
}