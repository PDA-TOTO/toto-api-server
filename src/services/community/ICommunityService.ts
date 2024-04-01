import { Repository } from "typeorm";
import Community from "../../dbs/main/entities/communityEntity";
import { IService } from "../IService";
import { Vote, VoteType } from "../../dbs/main/entities/voteEntity";
import { IStockService } from "../stock/IStockService";
import User from "../../dbs/main/entities/userEntity";

export type CommunityResponse = {
  id: number;
  codeId: string;
  voteTitle: string;
  startDate: Date;
  endDate: Date;
  numOfParticipants: number;
  numOfLikes: number;
  numOfUnlikes: number;
  isVoteType: VoteType;
  stockCodeName: string;
};

export interface ICommunityService extends IService {
  communityRepository: Repository<Community>;
  voteRepository: Repository<Vote>;
  userRepository: Repository<User>;
  stockService: IStockService;

  communityfindByCode(
    code: string,
    userId?: number
  ): Promise<CommunityResponse>;
  voteChange(
    userId: number,
    communityId: number,
    voteType: VoteType
  ): Promise<void>;
  getNaverStockInfo(code: string): Promise<void>;
  getNaverRisingStockInfo(list: string[]): Promise<any[]>;
}
