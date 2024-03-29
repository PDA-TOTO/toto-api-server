import { Repository } from "typeorm";
import Community from "../../dbs/main/entities/communityEntity";
import Comment from "../../dbs/main/entities/commentEntity";
import { IService } from "../IService";
import { Vote, VoteType } from "../../dbs/main/entities/voteEntity";
import Like, { LikeType } from "../../dbs/main/entities/likeEntity";
import { IStockService } from "../stock/IStockService";
import User from "../../dbs/main/entities/userEntity";

export type CommentType = {
  id: number;
  content: string;
  isLikeType: LikeType;
};

export type CommentResponse = {
  id: number;
  codeId: string;
  commentId: number;
  commentList: CommentType[];
};

export type commentFindByCommunityIdType = {
  id: number;
  content: string;
  communityId: number;
  isLiked: LikeType;
  writerId: number;
  writerVoteType: VoteType;
};

export interface ICommentService extends IService {
  communityRepository: Repository<Community>;
  commentRepository: Repository<Comment>;
  voteRepository: Repository<Vote>;
  userRepository: Repository<User>;
  likeRepository: Repository<Like>;
  stockService: IStockService;

  commentFindByCommunityId(
    communityId: number,
    userId?: number
  ): Promise<commentFindByCommunityIdType[]>;
  commentLike(
    commentId: number,
    userId: number,
    likeType: LikeType
  ): Promise<void>;
}
