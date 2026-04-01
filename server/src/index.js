import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';

import connectDatabase from './config/database.config.js';
import { initSocket } from './services/socket.service.js';
import clientRouter from './routes/client/index.route.js';
import AdminRouter from './routes/admin/index.route.js';


const app = express();
const PORT = process.env.PORT || 10000;

const server = http.createServer(app);
const ALLOWED_ORIGINS = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')
    : ['http://localhost:3800'];

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true
    }
});
initSocket(io);

connectDatabase();


app.use(cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(cookieParser());

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use("/api", clientRouter);
app.use("/api/admin", AdminRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});