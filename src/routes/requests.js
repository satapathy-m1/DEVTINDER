import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import ConnectionRequestModel from '../models/connectionRequest.js';
import User from '../models/user.js';
const requestsRouter = express.Router();

requestsRouter.post("/request/send/:status/:toUserId", authMiddleware, async (req, res) => {
    const user = req.user;
    const fromUserId = user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;
    const allowedStatuses = ["interested", "ignore"];
    if(!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status. Allowed statuses are 'interested' or 'ignore'." });
    }
    try {

        const existingRequest = await ConnectionRequestModel.findOne({
            $or: [
                { fromUserId: fromUserId, toUserId: toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        })
        if(existingRequest) {
            return res.status(400).json({ error: "Connection request already exists" });
        }
        const toUser = await User.findById(toUserId);
        if(!toUser) {
            return res.status(404).json({ error: "User not found kisko bhej rha bhai connection" });
        }
        // if(toUser._id.toString() === fromUserId.toString()) {
        //     return res.status(400).json({ error: "You cannot send a connection request to yourself wth man" });
        // }
        const newRequest = new ConnectionRequestModel({
            fromUserId : fromUserId,
            toUserId : toUserId,
            status : status
        })
        await newRequest.save();
        
        res.status(201).json({
            message: `${user.firstName} just felt ${status} with the thought of connecting with ${toUser.firstName}`,
            request: newRequest
        });
    }catch(err) {
        console.log("Error in sending connection request:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

requestsRouter.post("/request/review/:status/:requestId", authMiddleware, async (req, res) => {
    const loggedInUser = req.user;
    const { requestId, status } = req.params;
    const allowedStatuses = ["rejected", "accepted"];
    if(!allowedStatuses.includes(status)) {
        res.status(400).json({message : "Invalid status. Allowed statuses are 'rejected' or 'accepted'"});
        return;
    }
    try{
        const request = await ConnectionRequestModel.findOne({
            _id : requestId,
            toUserId : loggedInUser._id,
            status : "interested"
        })
        if(!request) {
            return res.status(404).json({error : "Connection request not found or already reviewed"});
        }
        request.status = status;
        await request.save();
        const fromUser = await User.findById(request.fromUserId);
        if(!fromUser) {
            return res.status(404).json({ error: "User who sent the request not found" });
        }
        res.status(200).json({
            message: `${loggedInUser.firstName} has ${status} the connection request from ${fromUser.firstName}`,
            request: request
        });

    }catch(err) {
        console.log("Error in reviewing connection request:", err);
        return res.status(500).json({error : "Error in reviewing connection request"});
    }
});

export default requestsRouter;