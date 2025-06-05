import jwt from "jsonwebtoken";
import User from "../models/user.js"; 
import dotenv from "dotenv";
dotenv.config();


const authMiddleware = async (req, res, next) => {
    const {token} = req.cookies;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = decodedData;

        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user; // Attach user to request object
        next();
    }catch(err) {
        res.status(400).json("Invalid Token");
    }
}

export default authMiddleware;