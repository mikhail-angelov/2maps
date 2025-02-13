import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user";

@Entity({ name: "track" })
export class Track {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.tracks)
  @JoinColumn({ name: "user_id" })
  user?: User;

  @Column({ default: "" })
  name!: string;

  @Column({ type: "simple-json", name: "geo_json" })
  geoJson!: string;

  @Column({ type: "blob", nullable: true })
  image?: Buffer;

  @Column()
  timestamp!: Date;
}
