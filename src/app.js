import express from 'express';
import connectDB from './config/database.js';
import User from "./models/user.js";
import { signupValidator } from './middlewares/validators/userValidator.js';
import { validate } from './middlewares/validators/validate.js';
import bcrypt from 'bcrypt';
import { cookie } from 'express-validator';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import authMiddleware from './middlewares/auth.js';
import cors from 'cors';
const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

import authRouter from './routes/auth.js';
import requestsRouter from './routes/requests.js';
import profileRouter from './routes/profile.js';
import userRouter from './routes/user.js';


app.use('/', authRouter);
app.use('/', requestsRouter);
app.use('/', profileRouter);
app.use('/', userRouter);


app.listen(7777, () => {
    console.log('Server is running on port 7777');
});