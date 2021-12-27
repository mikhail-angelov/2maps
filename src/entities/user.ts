import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Mark } from "./mark";

@Entity({name:'user'})
export class User {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column({ nullable: true, name: 'reset_token' })
    resetToken?: string;

    @OneToMany(
        () => Mark,
        mark => mark.user,
        { cascade: true },
    )
    marks?: Mark[];
}