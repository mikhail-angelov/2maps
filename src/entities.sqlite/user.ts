import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Role } from "./enums";
import { Mark } from "./mark";
import { Track } from "./track";

@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true, name: "reset_token" })
  resetToken?: string;

  @OneToMany(() => Mark, (mark) => mark.user)
  marks?: Mark[];

  @OneToMany(() => Track, (track) => track.user)
  tracks?: Track[];

  @Column({
    type: "simple-enum",
    enum: Role,
    nullable: false,
    default: Role.user,
  })
  role!: Role;
}
