import express from 'express';
import connectDB from './config/database.js';
import User from "./models/User.js";
import { signupValidator } from './middlewares/validators/userValidator.js';
import { validate } from './middlewares/validators/validate.js';
import bcrypt from 'bcrypt';
import { cookie } from 'express-validator';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import authMiddleware from './middlewares/auth.js';
const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/user", async (req, res) => {
    try{
        const users = await User.find({"email" : "tt@gmail.com"});
        console.log(users);
        
        res.status(200).json({
            message: "Users fetched successfully!",
            users: users
        });
    }
    catch(err) {
        console.error("Error in finding the users :->" + err);
        res.status(500).json({message : "Error fetching users"});
    }
})

app.patch("/user", async (req, res) => {
    const { _id, ...updateData } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User updated successfully!",
            user: updatedUser
        });
    } catch (err) {
        console.error("Error in updating the user :->", err);
        res.status(500).json({ message: "Error updating user" });
    }
});



app.post("/user", async (req, res) => {
    const { currentEmail, newEmail } = req.body;

    const query = { email: currentEmail };
    const update = { email: newEmail };
    const options = { new: true };

    try {
        const user = await User.findOne(query);
        console.log("user found :->", user); //isme aa rha user
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const updatedUser = await User.findOneAndUpdate(query, update, options);
        

        res.send(updatedUser);
        console.log("user updated :->", updatedUser); //isme aa rha user
    } catch (err) {
        console.error("Error in updating the user :->", err);
        res.status(500).json({ message: "Error updating user" });
    }
});



app.post("/signup", signupValidator, validate, async (req, res) => {
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

app.post("/login", async (req,res) => {
    
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email :email });
        console.log("User found :->", user); // Log the user found
        
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
        res.send("Login successful!");
    } catch (err) {
        console.error("Error in login :->", err);
        res.status(500).json({ message: "Error logging in" });
    }
});

app.get("/profile", authMiddleware, async (req, res) => {
    try{
        const user = req.user; // User is attached to the request object by authMiddleware
        res.send(user);
    }catch(err){
        console.log("Error in fetching profile :->", err);
        res.status(500).json({ message: "Error fetching profile" });
    }
});

app.listen(7777, () => {
    console.log('Server is running on port 7777');
});