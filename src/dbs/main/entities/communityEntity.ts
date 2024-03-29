import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import CODE from "./codeEntity";
import { Vote } from "./voteEntity";

@Entity()
export default class Community {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => CODE, { cascade: true })
  @JoinColumn({ name: "code" })
  code: CODE;

  @Column({ type: "varchar", length: 100, comment: "투표 주제", default: "" })
  voteTitle: string;

  @Column({ type: "date", comment: "투표 시작 날짜" })
  startDate: Date;

  @Column({ type: "date", comment: "투표 마감 날짜" })
  endDate: Date;

  @OneToMany(() => Vote, (vote) => vote.community)
  votes: Vote[];
}
