import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import CODE from "./codeEntity";

@Entity()
export default class Community {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => CODE, { cascade: true })
  @JoinColumn({ name: "code" })
  code: CODE;

  @Column({ type: "varchar", length: 100, comment: "투표 주제" })
  voteTitle: string;

  @Column({ type: "int", comment: "찬성 표 수", unsigned: true, default: 0 })
  yesCount: number;

  @Column({ type: "int", comment: "반대 표 수", unsigned: true, default: 0 })
  noCount: number;

  @Column({ type: "date", comment: "투표 시작 날짜" })
  startDate: Date;

  @Column({ type: "date", comment: "투표 마감 날짜" })
  endDate: Date;

  @CreateDateColumn({ comment: "회원가입날짜" })
  createdAt: Date;
}
