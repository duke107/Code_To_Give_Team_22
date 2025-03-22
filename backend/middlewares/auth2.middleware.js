import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if(!token) {
        return res.status(401).json({
            success: false,
            messsage: "Authentication required - Log in to continue"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.id;
        return next();
    } catch (error) {
        if(error.name === "TokenExpiredError") {
            return res.status(401).json({ 
                success: false, 
                message: "Session expired - Log in again" 
            });
        }
        else {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid or tampered token - Access denied" 
            });
        }
    }
};
        
