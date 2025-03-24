import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
export const isAuthenticated =async(req,res,next)=>{
    try {
        // console.log(req);
        const {token}=req.cookies;
        // console.log(token);
        if(!token){
           return res.status(401).json({msg:"user is not authenticated"});
           }
           const decoded=jwt.verify(token,process.env.JWT_SECRET)
        //    console.log("this is decode", decoded);
           req.user =await User.findById(decoded.id);
           next();
    } catch (error) {
        console.log('====================================');
        console.log(error.message);
        return res.status(401).json({msg:"Unauthorized"})
    }
   
    };
        
