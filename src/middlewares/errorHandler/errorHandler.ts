import { Request, Response, NextFunction } from 'express';
import ApplicationError from '../../utils/error/applicationError';

export default (err: Error, req: Request, res: Response, next: NextFunction) => {
  
    if (err instanceof ApplicationError) {
        res.status(err.status).json({
            success: false,
            message: err.message,
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Server Internal Error',
    });
};
