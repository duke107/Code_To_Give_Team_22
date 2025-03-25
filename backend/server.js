import cookieParser from "cookie-parser";
import { app } from "./app.js";
import cron from "node-cron";
import { Server } from "socket.io";
import http from "http"
import { sendReminderNotifications,sendEventCompletionNotifications } from "./controllers/notification.controller.js";
import { markCompletedEvents } from "./controllers/event.controller.js"

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
})

io.on("connection", (socket) => {
    // console.log("Client connected:", socket.id);
  
    socket.on("join", (userId) => {
      console.log(`User ${userId} joined room`);
      socket.join(userId);
      socket.emit("joined-room", userId);
    });
  
    socket.on("disconnect", () => {
      // console.log("Client disconnected:", socket.id);
    });
  });
export {io}


server.listen(process.env.PORT || 3000,()=>{
  console.log(`Server is running on port ${process.env.PORT}`);
})


//middleware for error handling

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error"; 
    res.status(statusCode).json({
        success: false,
        statusCode,
        message, 
    });
});

//cron job to send reminder notifications everyday 8AM 
cron.schedule("0 8 * * *", async () => {
    console.log("Running reminder notifications job");
    await sendReminderNotifications();
});

//cron job to check for completed evernts
cron.schedule("* * * * *", async () => {  // Runs every minute
  // console.log("Checking for completed events...");
  await sendEventCompletionNotifications();
});