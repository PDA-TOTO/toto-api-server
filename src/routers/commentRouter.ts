import express, { Router, Request, Response, NextFunction } from "express";
import { AppDataSource } from "../dbs/main/dataSource";
import { CommunityService } from "../services/community/CommunityServiceImpl";
import { CommentService } from "../services/comment/CommentServiceImpl";
import {
  nullalbeAuthenticate,
  authenticate,
} from "../middlewares/authenticate/authenticate";

const router: Router = express.Router();
const commentService = new CommentService(AppDataSource.createQueryRunner());

router.get(
  "/",
  nullalbeAuthenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { communityId } = req.body;
      const result = await commentService.commentFindByCommunityId(
        communityId,
        req.user?.id
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/like",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId, likeType } = req.body;
      console.log(commentId, likeType, req.user?.id);
      const result =
        req.user &&
        (await commentService.commentLike(commentId, req.user.id, likeType));
      res.status(200).json({
        success: true,
        message: "좋아요 완료",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
