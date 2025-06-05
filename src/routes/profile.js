import express from "express";
import authMiddleware from "../middlewares/auth.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
const profileRouter = express.Router();
profileRouter.get("/profile/view", authMiddleware, async (req, res) => {
    try{
        const user = req.user; // User is attached to the request object by authMiddleware
        res.send(user);
    }catch(err){
        console.log("Error in fetching profile :->", err);
        res.status(500).json({ message: "Error fetching profile" });
    }
});

profileRouter.patch("/profile/edit", authMiddleware, async (req, res) =>{
    const user = req.user; // User is attached to the request object by authMiddleware
    const updates = req.body; // Get the updates from the request body
    try{   
        Object.keys(updates).forEach((key) => {
            if(user[key] !== undefined && key !== "password" && key !== "email") {
                user[key] = updates[key]; // Update the user object with the new values
            }
            else{
                console.log(`Skipping update for ${key} as it is not allowed`);  
                res.status(400).json({ message: `Cannot update ${key}` });
                     
            }
        })

        await user.save();
        res.status(200).json({message : `${user.firstName} your Profile has been updated successfully`, user});

    }catch(err){
        console.log("Error in updating profile :->", err);
        res.status(500).json({ message: "Error updating profile" });
    }
})

profileRouter.patch("/profile/edit/password", authMiddleware, async (req, res) => {
    const user =  req.user;
    const { currentPassword, newPassword } = req.body;
    try{
        const isPasswordValid = await user.validatePassword(currentPassword);
        if(!isPasswordValid) {
            res.status(401).json({ message: "Current password is incorrect" });
        }

        if(newPassword === currentPassword) {
            return res.status(400).json({ message: "New password cannot be the same as current password" });
        }
        const isNewPasswordStrongAndDifferent = await user.validateNewPassword(newPassword);
        console.log("aaya");
        
        if(!isNewPasswordStrongAndDifferent) {
            return res.status(400).json({ message: "New password is not strong enough" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password updated successfully" });
    }catch(err) {
        console.log("Error in updating password", err);
        res.status(500).json({ message: "Error updating password"})
        
    }
})
export default profileRouter;