import express from 'express';
import User from '../models/user.js';
import { signupValidator } from '../middlewares/validators/userValidator.js';
import { validate } from '../middlewares/validators/validate.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import authMiddleware from '../middlewares/auth.js';
const authRouter = express.Router();

authRouter.post("/signup", signupValidator, validate, async (req, res) => {
    const user = new User(req.body);
    

    try {
        const password = user.password;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user.password = hashedPassword; // Hash the password before saving
        console.log("Password :->", user.password); // Log the hashed password
        console.log("User data :->", user); // Log the user data before saving
        
        await user.save();
        res.status(201).json({ message: "User created successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error creating user",
            error: err.message
        });
    }
});

authRouter.post("/login", async (req,res) => {
    
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email :email });
        console.log("User found :->", user); 

        if(!user) {
            return res.status(404).json({message : "Invalid credentials"});
        }
        const isPasswordValid = await user.validatePassword(password);
        if(!isPasswordValid) {
            
            
            return res.status(401).json({message : "Invalid credentials"});
        }
        console.log("Password matched for user :->", user.email); // Log the successful password match
        const token = await user.getJWT();
        console.log("JWT Token generated :->", token); // Log the generated JWT token
        console.log("jwt secret :->", process.env.JWT_SECRET); // Log the JWT secret
        
        res.cookie("token", token, {
            httpOnly: true,
        });
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.json(userWithoutPassword);
    } catch (err) {
        console.error("Error in login :->", err);
        res.status(500).json({ message: "Error logging in" });
    }
});

authRouter.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully!" });
         
})


export default authRouter;