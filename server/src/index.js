import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import coookieParser from 'cookie-parser';

import connectDatabase from './config/database.config.js';
import { initSocket } from './services/socket.service.js';
import clientRouter from './routes/client/index.route.js';
import AdminRouter from './routes/admin/index.route.js';


const app = express();
const PORT = 10000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3800'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});
initSocket(io);

connectDatabase();


app.use(cors({
    origin: [
        'http://localhost:3800'
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(coookieParser());

app.use(express.json());

app.use("/api", clientRouter);
app.use("/api/admin", AdminRouter);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});