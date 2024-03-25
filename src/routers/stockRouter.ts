import express, { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { Cheerio } from "cheerio";
import axios from "axios";

const router: Router = express.Router();

// 주식 뉴스 가져오기
router.get(
  "/:stockId/news",
  async (req: Request, res: Response, next: NextFunction) => {
    const url = `https://m.stock.naver.com/api/news/stock/${req.params.stockId}?pageSize=20&page=1`;
    const response = await axios.get(url);
    res.send(response.data);
  }
);

export default router;
