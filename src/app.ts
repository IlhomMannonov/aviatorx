import 'reflect-metadata';
import express, {Application} from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import {errorHandler} from './middlewares/errorHandlers';
import {connectDB} from './config/db';
import authRouter from "./routes/AuthRouter";
import utilsController from "./routes/UtilsRouter";
import gameApiRouter from "./routes/GameApiRouter";
import telegramBotRouter from "./routes/TelegramBotRouter";
import aviatrxRouter from "./routes/AviatrxRouter";
import cors from 'cors'; // CORS ni import qilish
const app: Application = express();

// PostgreSQL bazasiga ulanish
connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// app.use('/api/users', userRoutes);
app.use('/api/v1', authRouter);
app.use('/api/v1', utilsController);
app.use('/api/v1', gameApiRouter);
app.use('/api/v1', aviatrxRouter);
app.use('/', telegramBotRouter);

app.use(errorHandler);

export default app;
