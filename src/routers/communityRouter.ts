import express, { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../dbs/main/dataSource';
import { CommunityService } from '../services/community/CommunityServiceImpl';
import { nullalbeAuthenticate, authenticate } from '../middlewares/authenticate/authenticate';

const router: Router = express.Router();
console.log('---- star community ----');
const communityService = new CommunityService(AppDataSource.createQueryRunner());

router.get('/:krxCode', nullalbeAuthenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { krxCode } = req.params;
        const result = await communityService.communityfindByCode(krxCode, req.user?.id);

        return res.status(200).json({
            success: true,
            message: '커뮤니티 조회 완료',
            result: result,
        });
    } catch (err) {
        next(err);
    }
});

router.post('/vote/:krxCode', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { communityId, voteType } = req.body;
        const result = req.user && (await communityService.voteChange(req.user.id, communityId, voteType));
        return res.status(200).json({
            success: true,
            message: '투표 완료',
            result: result,
        });
    } catch (error) {
        next(error);
    }
});
export default router;
