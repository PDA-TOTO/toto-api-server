import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./userEntity";
import Community from "./communityEntity";

export enum VoteType {
  NONE = "NONE",
  LIKE = "LIKE",
  UNLINK = "UNLIKE",
}

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Community, { cascade: true })
  @JoinColumn({ name: "community_id" })
  community: Community;

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({
    name: "vote_type",
    type: "enum",
    enum: VoteType,
    default: VoteType.NONE,
    comment: "투표 타입",
  })
  voteType: VoteType;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
