import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Vote } from "./voteEntity";
import Community from "./communityEntity";
import User from "./userEntity";
import Like from "./likeEntity";

@Entity()
export default class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Community, { cascade: true })
  @JoinColumn({ name: "community_id" })
  community: Community;

  // comment 단 user
  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Vote, { cascade: true })
  @JoinColumn({ name: "vote_id" })
  vote: Vote;

  @Column({ type: "varchar", length: 100, comment: "내용", default: "" })
  content: string;

  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];

  @CreateDateColumn({ comment: "댓글 생성 날짜" })
  createdAt: Date;
}
