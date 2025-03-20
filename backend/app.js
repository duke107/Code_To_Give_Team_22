import cookieParser from "cookie-parser";
import express from "express";

import { config } from "dotenv";
import cors from "cors"
import { connectDB } from "./db/db.js";
import authRouter from './routes/user.route.js'
export const app=express();

config({path:"./config/config.env"});

app.use(cors({
    origin:["http://localhost:5173"],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/v1/auth",authRouter)
connectDB()