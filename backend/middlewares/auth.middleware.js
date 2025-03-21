import { User } from "../models/volunteer.model.js";
import jwt from "jsonwebtoken"
export const isAuthenticated =async(req,res,next)=>{
     const {token}=req.cookies;
     if(!token){
        return res.status(401).json({msg:"user is not authenticated"});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        console.log(decoded);
        req.user =await User.findById(decoded.id);
        next();
    };
        
