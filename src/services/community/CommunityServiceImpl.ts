import { Repository, QueryRunner } from "typeorm";
import Community from "../../dbs/main/entities/communityEntity";
import { Vote, VoteType } from "../../dbs/main/entities/voteEntity";
import { CommunityResponse, ICommunityService } from "./ICommunityService";
import { Transaction } from "../transaction";
import { IStockService } from "../stock/IStockService";
import { StockService } from "../stock/StockServiceImpl";
import ApplicationError from "../../utils/error/applicationError";
import User from "../../dbs/main/entities/userEntity";

export class CommunityService implements ICommunityService {
  communityRepository: Repository<Community>;
  voteRepository: Repository<Vote>;
  userRepository: Repository<User>;
  stockService: IStockService;
  queryRunner: QueryRunner;
  name: string = "CommunityService";

  constructor(queryRunner: QueryRunner) {
    this.setQueryRunner(queryRunner);
  }

  setQueryRunner(queryRunner: QueryRunner): void {
    this.queryRunner = queryRunner;
    this.communityRepository = queryRunner.manager.getRepository(Community);
    this.voteRepository = queryRunner.manager.getRepository(Vote);
    this.userRepository = queryRunner.manager.getRepository(User);

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
  async communityfindByCode(
    code: string,
    userId?: number | undefined
  ): Promise<CommunityResponse> {
    const stockCode = await this.stockService.findByCode(code);
    if (!stockCode) {
      throw new ApplicationError(400, "해당 코드의 주식이 존재하지 않음");
    }

    const community: Community | null = await this.communityRepository.findOne({
      where: { code: { krxCode: stockCode.krxCode } },
      relations: ["votes", "votes.user", "votes.community"],
    });

    if (!community) {
      throw new ApplicationError(400, "해당 커뮤니티가 존재하지 않음");
    }

    let likes = 0;
    let userVoteType = VoteType.NONE;
    const filterVote = community.votes.filter((vote) => {
      if (vote.voteType === VoteType.LIKE) {
        likes += 1;
      }

      if (vote.user.id === userId && vote.voteType !== VoteType.NONE) {
        userVoteType = vote.voteType;
      }

      return vote.voteType !== VoteType.NONE;
    });

    return {
      id: community.id,
      codeId: stockCode.krxCode,
      voteTitle: community.voteTitle,
      startDate: community.startDate,
      endDate: community.endDate,
      numOfParticipants: filterVote.length,
      numOfLikes: likes,
      numOfUnlikes: filterVote.length - likes,
      isVoteType: userVoteType,
    };
  }

  @Transaction()
  async voteChange(
    userId: number,
    communityId: number,
    voteType: VoteType
  ): Promise<void> {
    const user: User | null = await this.userRepository.findOne({
      where: { id: userId },
    });
    const community: Community | null = await this.communityRepository.findOne({
      where: { id: communityId },
    });
    const vote = await this.voteRepository.findOne({
      where: { community: { id: communityId }, user: { id: userId } },
    });

    if (!vote && community && user) {
      const newVote: Vote = new Vote();
      newVote.community = community;
      newVote.user = user;
      newVote.voteType = voteType;
      try {
        await this.voteRepository.save(newVote);
      } catch (error) {
        console.error("Error saving vote1:", error);
      }
    } else if (vote && community && user) {
      try {
        await this.voteRepository.update(
          { community: { id: communityId }, user: { id: userId } },
          { voteType: voteType }
        );
      } catch (error) {
        console.error("Error saving vote2:", error);
      }
    }
  }
}
