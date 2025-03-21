import cookieParser from "cookie-parser";
import { app } from "./app.js";

app.listen(process.env.PORT || 3000,()=>{
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