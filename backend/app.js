import cookieParser from "cookie-parser";
import express from "express";

import { config } from "dotenv";
import cors from "cors"
import { connectDB } from "./db/db.js";

import authRouter from './routes/user.route.js'
import eventRouter from "./routes/event.route.js"
import notificationRouter from "./routes/notification.route.js"
import donationRouter from "./routes/donation.route.js"
import adminRouter from "./routes/admin.route.js";
import contactRouter from "./routes/contact.route.js"
import analyzeRouter from "./routes/analyze.route.js";

export const app = express();

config({path:"./config/config.env"});

app.use(cors({
    origin:["http://localhost:5173"],
    methods:["GET","POST","PUT","DELETE","PATCH"],
    credentials:true,
}));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/events", eventRouter)
app.use("/api/v1/notification", notificationRouter)
app.use("/api/v1/donate", donationRouter)
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/analyze", analyzeRouter);
connectDB()

// app.listen(3000, () => {
//     console.log("Started listening at port 3000");
// });

app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`Registered route: ${r.route.path}`);
    }
  });
  