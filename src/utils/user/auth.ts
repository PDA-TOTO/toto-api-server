import { VisibleUser } from "../../services/user/userServiceReturnType";

const jwt = require("jsonwebtoken");


export function createToken(visibleUser: VisibleUser){
    return jwt.sign(visibleUser, process.env.JWT_SECRET || "MyJWT");
}

export function verifyToken(_token: string){
    if(!_token){
        return null;
    }
    const verifyToken = jwt.verify(_token, process.env.JWT_SECRET||"MyJWT");
    return verifyToken;
}
