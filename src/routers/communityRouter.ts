import express, { Router, Request, Response, NextFunction } from "express";
import { getCommunityFindByKrxCode } from "../services/community/commuityService";

const router: Router = express.Router();

router.get(
  "/:krxCode",
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await getCommunityFindByKrxCode(req.params.krxCode);
    res.json(result);
  }
);

router.post(
  "/:krxCode/vote",
  async (req: Request, res: Response, next: NextFunction) => {
    res.json("hi");
  }
);
export default router;
