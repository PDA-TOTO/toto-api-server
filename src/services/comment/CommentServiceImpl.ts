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

    if (!this.queryRunner.instances) {
      this.queryRunner.instances = [];
    }

    this.queryRunner.instances.push(this.name);

    if (this.queryRunner.instances.includes(StockService.name)) {
      return;
    }

    this.stockService = new StockService(queryRunner);
  }

  @Transaction()
  async commentFindByCommunityId(
    communityId: number,
    userId?: number | undefined
  ): Promise<CommentResponse> {
    const comment = await this.commentRepository.find({
      where: { community: { id: communityId } },
      relations: ["likes", "vote", "vote.user", "likes.user"],
    });
    // console.log("comment:", comment);

    const filterComment = comment.map((comment) => {
      console.log(comment);
      if (comment.likes.length > 0) {
        console.log("[LIKE]:", comment.likes);
      }
    });

    return Promise.resolve({
      id: 1,
      codeId: "string",
      commentId: 1,
      commentList: [],
    });
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
}
