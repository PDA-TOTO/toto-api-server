import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../utils/user/auth";
import ApplicationError from "../../utils/error/applicationError";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies.authToken;
    let headerToken = req.headers.authorization;

    console.log(token, headerToken);
    // console.log(req);
    if (!token && headerToken) {
      token = headerToken.split(" ")[1];
    }

    const user = verifyToken(token);
    req.user = user;

    if (!user) {
      return next(new ApplicationError(401, "Unauthorized"));
    }
    next();
  } catch {
    req.user = undefined;
    next(new ApplicationError(401, "Unauthorized"));
  }
}

export function nullalbeAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let token = req.cookies.authToken;
    let headerToken = req.headers.authorization;

    // console.log(token, headerToken)
    // console.log(req)
    if (!token && headerToken) {
      token = headerToken.split(" ")[1];
    }

    const user = verifyToken(token);
    req.user = user;
    next();
  } catch {
    req.user = undefined;
  }
}
