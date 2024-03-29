import { Repository, QueryRunner } from "typeorm";
import Comment from "../../dbs/main/entities/commentEntity";
import Community from "../../dbs/main/entities/communityEntity";
import User from "../../dbs/main/entities/userEntity";
import { Vote } from "../../dbs/main/entities/voteEntity";
import { IStockService } from "../stock/IStockService";
import { CommentResponse, ICommentService } from "./ICommentService";
import { StockService } from "../stock/StockServiceImpl";
import { Transaction } from "../transaction";
import Like, { LikeType } from "../../dbs/main/entities/likeEntity";
import { commentFindByCommunityIdType } from "./ICommentService";
import { createService } from "../serviceCreator";

export class CommentService implements ICommentService {
  communityRepository: Repository<Community>;
  commentRepository: Repository<Comment>;
  voteRepository: Repository<Vote>;
  userRepository: Repository<User>;
  stockService: IStockService;
  likeRepository: Repository<Like>;

  queryRunner: QueryRunner;
  name: string;

  constructor(queryRunner: QueryRunner) {
    this.setQueryRunner(queryRunner);
  }

  setQueryRunner(queryRunner: QueryRunner): void {
    this.queryRunner = queryRunner;
    this.commentRepository = queryRunner.manager.getRepository(Comment);
    this.communityRepository = queryRunner.manager.getRepository(Community);
    this.voteRepository = queryRunner.manager.getRepository(Vote);
    this.userRepository = queryRunner.manager.getRepository(User);
    this.likeRepository = queryRunner.manager.getRepository(Like);
    this.stockService = createService(
      queryRunner,
      StockService.name,
      this,
      this.name
    ) as IStockService;
  }

  @Transaction()
  async commentFindByCommunityId(
    communityId: number,
    userId?: number | undefined
  ): Promise<commentFindByCommunityIdType[]> {
    const comment = await this.commentRepository.find({
      where: { community: { id: communityId } },
      relations: ["likes", "vote", "vote.user", "likes.user"],
    });

    const filterComment = comment.map((comment) => {
      const { likes, vote, ...commentWithoutLikes } = comment;
      let isLiked: LikeType = LikeType.UNLIKE;
      if (comment.likes.length > 0) {
        comment.likes.map((like) => {
          if (like.likeType === LikeType.LIKE && like.user.id === userId) {
            isLiked = LikeType.LIKE;
          }
        });
      }
      return {
        ...commentWithoutLikes,
        commentId: comment.id,
        communityId: communityId,
        isLiked: isLiked,
        writerId: comment.vote.user.id,
        writerEmail: comment.vote.user.email,
        writerVoteType: comment.vote.voteType,
        likeAmount: comment.likes.length,
      };
    });

    return Promise.resolve(filterComment);
  }

  @Transaction()
  async commentLike(
    commentId: number,
    userId: number,
    likeType: LikeType
  ): Promise<void> {
    const comment: Comment | null = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    const user: User | null = await this.userRepository.findOne({
      where: { id: userId },
    });
    const like: Like[] | null = await this.likeRepository.find({
      where: { comment: { id: commentId }, user: { id: userId } },
    });

    if (like.length === 0 && comment && user) {
      const newLike: Like = new Like();
      newLike.comment = comment;
      newLike.user = user;
      newLike.likeType = likeType;
      try {
        await this.likeRepository.save(newLike);
      } catch (error) {
        console.log("error1:", error);
      }
    } else if (comment && user) {
      try {
        await this.likeRepository.update(
          { id: like[0].id },
          {
            likeType: likeType,
          }
        );
      } catch (error) {
        console.log("error2:", error);
      }
    }
  }

  @Transaction()
  async commentSave(
    content: string,
    userId: number,
    communityId: number
  ): Promise<void> {
    const vote: Vote | null = await this.voteRepository.findOne({
      where: { community: { id: communityId }, user: { id: userId } },
    });
    const user: User | null = await this.userRepository.findOne({
      where: { id: userId },
    });
    const community: Community | null = await this.communityRepository.findOne({
      where: { id: communityId },
    });
    if (vote && user && community) {
      const newComment = new Comment();
      newComment.content = content;
      newComment.user = user;
      newComment.community = community;
      newComment.vote = vote;
      try {
        await this.commentRepository.save(newComment);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
