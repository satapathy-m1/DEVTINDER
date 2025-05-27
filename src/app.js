import express from 'express';
import connectDB from './config/database.js';
import User from "./models/User.js";
import { signupValidator } from './middlewares/validators/userValidator.js';
import { validate } from './middlewares/validators/validate.js';
import bcrypt from 'bcrypt';
const app = express();
app.use(express.json());

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
        
        if(user.length === 0) {
            return res.status(404).json({message : "Invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(401).json({message : "Invalid credentials"});
        }
        res.status(200).json({
            message: "Login successful!",
            user: user
        });
    } catch (err) {
        console.error("Error in login :->", err);
        res.status(500).json({ message: "Error logging in" });
    }
});

app.listen(7777, () => {
    console.log('Server is running on port 7777');
});