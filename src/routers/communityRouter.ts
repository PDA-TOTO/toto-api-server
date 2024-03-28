import express, { Router, Request, Response, NextFunction } from "express";
import {
  getCommunityFindByKrxCode,
  //   submitVote,
} from "../services/community/commuityService";
import { ICommunityService } from "../services/community/ICommunityService";
import { AppDataSource } from "../dbs/main/dataSource";
import { CommunityService } from "../services/community/CommunityServiceImpl";
import { nullalbeAuthenticate } from "../middlewares/authenticate/authenticate";

const router: Router = express.Router();
const communityService = new CommunityService(
  AppDataSource.createQueryRunner()
);

router.get(
  "/:krxCode",
  nullalbeAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { krxCode } = req.params;
      const result = await communityService.communityfindByCode(
        krxCode,
        req.user?.id
      );

      return res.status(200).json({
        success: true,
        message: "커뮤니티 조회 완료",
        result: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// router.post(
//   "/:krxCode/vote",
//   async (req: Request, res: Response, next: NextFunction) => {
//     const result = await submitVote(
//       req.params.krxCode,
//       req.body.vote,
//       req.body.first
//     );
//     res.json(result);
//   }
// );
export default router;
