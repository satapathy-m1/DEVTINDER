import express from 'express';
import authMiddleware from '../middlewares/auth.js';

const requestsRouter = express.Router();

requestsRouter.post("/sendConnectionRequest", authMiddleware, async (req, res) => {
    const user = req.user;

    res.send(user + " sent a connection request!");
});

export default requestsRouter;