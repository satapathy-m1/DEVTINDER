import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import ConnectionRequestModel from '../models/connectionRequest.js';
import User from '../models/user.js';

const userRouter = express.Router();
const USER_SAFE_FIELDS = 'firstName lastName profilePicture skills'; // Define the fields to be returned for user details

//get all the pending connection requests
userRouter.get('/user/requests/received', authMiddleware, async(req, res) => {
    const user = req.user;
    try {
        // Assuming you have a method to get pending requests for the user
        const pendingRequests = await ConnectionRequestModel.find({
            toUserId : user._id,
            status : "interested"
        }).populate('fromUserId', USER_SAFE_FIELDS); // Populating the fromUserId to get user details
        if (!pendingRequests || pendingRequests.length === 0) {
            return res.status(404).json({ message: "No pending requests found" });
        }

        
        res.status(200).json({
            message: `Pending requests retrieved successfully for user ${user.firstName} ${user.lastName}`,
            requests: pendingRequests
        });
    } catch (err) {
        console.error("Error retrieving pending requests:", err);
        res.status(500).json({ error: "Internal server error" });
    }
})

// get /user/connections
userRouter.get('/user/connections', authMiddleware, async(req, res) => {
    const loggedInUser = req.user;
    try {
        // Assuming you have a method to get connections for the user
        const connections = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" }
            ]
        }).populate('fromUserId', USER_SAFE_FIELDS)
          .populate('toUserId', USER_SAFE_FIELDS);
        
        const formattedConnections = connections.map((connection) => {
            const isFromUser = connection.fromUserId._id.toString() === loggedInUser._id.toString();
            return {
                _id: connection._id,
                user: isFromUser ? connection.toUserId : connection.fromUserId,
                status: connection.status,
                createdAt: connection.createdAt,
                updatedAt: connection.updatedAt
            };
        });
        res.status(200).json({
            message: `Connections retrieved successfully for user ${loggedInUser.firstName} ${loggedInUser.lastName}`,
            connections: formattedConnections
        });
    } catch (err) {
        console.error("Error retrieving connections:", err);
        res.status(500).json({ error: "Internal server error" });
    }
})

//get user/feed
userRouter.get('/user/feed', authMiddleware, async(req, res) => {

        //user should be able to see all the users in the feed except:-
        // 1. Himself
        //2.his connections
        //3 ignored people
        //4 alreadt sent connection requests
    try{
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        let limit = parseInt(req.query.limit) || 20; // Default to 20 items per page
        if(limit > 50) limit = 50; // Limit the maximum number of items to 50
        if (page < 1) {
            return res.status(400).json({ error: "Invalid page number" });
        }
        const loggedInUser = req.user;
        const connections = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id},
                { toUserId: loggedInUser._id }
            ]
        }).select('fromUserId toUserId');

        const hideUserIds = new Set();
        connections.forEach(connection => {
            hideUserIds.add(connection.fromUserId.toString());
            hideUserIds.add(connection.toUserId.toString());
        })

        const usersToShow = await User.find({
            $and: [{_id : { $nin: Array.from(hideUserIds) }},
           { _id: { $ne: loggedInUser._id }}]
        }).skip((page - 1) * limit) // Skip the number of items based on the page
        .limit(limit) // Limit the number of items returned
        .select(USER_SAFE_FIELDS); // Select only the safe fields to return

        if (!usersToShow || usersToShow.length === 0) {
            return res.status(404).json({ message: "No users found in the feed" });
        }
        res.status(200).json({
            message: `Feed retrieved successfully for user ${loggedInUser.firstName} ${loggedInUser.lastName}`,
            feed: usersToShow
        });

    }catch(err) {
        console.error("Error retrieving user feed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default userRouter;