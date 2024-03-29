import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Vote } from "./voteEntity";
import Community from "./communityEntity";
import User from "./userEntity";
import Comment from "./commentEntity";

export enum LikeType {
  NONE = "NONE",
  LIKE = "LIKE",
  UNLIKE = "UNLIKE",
}

@Entity()
export default class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Comment, { cascade: true })
  @JoinColumn({ name: "comment_id" })
  comment: Comment;

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({
    name: "like_type",
    type: "enum",
    enum: LikeType,
    default: LikeType.NONE,
    comment: "좋아요 타입",
  })
  likeType: LikeType;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
