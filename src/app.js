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
const app = express();
app.use(express.json());
app.use(cookieParser());

import authRouter from './routes/auth.js';
import requestsRouter from './routes/requests.js';
import profileRouter from './routes/profile.js';

app.use('/', authRouter);
app.use('/', requestsRouter);
app.use('/', profileRouter);


app.listen(7777, () => {
    console.log('Server is running on port 7777');
});