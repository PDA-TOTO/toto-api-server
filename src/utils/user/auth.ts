import { VisibleUser } from "../../services/user/userServiceReturnType";

const jwt = require("jsonwebtoken");


export function createToken(visibleUser: VisibleUser, maxAge:number = 60*60*24*3){
    console.log(maxAge)
    return jwt.sign(visibleUser, process.env.JWT_SECRET || "MyJWT",{
        expiresIn: maxAge,
    });
}


export function verifyToken(_token: string){
    try{

        if(!_token){
            return null;
        }
        const verifyToken = jwt.verify(_token, process.env.JWT_SECRET||"MyJWT")

        return verifyToken;
    }catch(err){

        // throw new Error('Verify Token Error')
        console.log(err);
    }
    
}
