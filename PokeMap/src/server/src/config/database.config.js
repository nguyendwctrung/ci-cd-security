import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export default function connectDatabase() {
    mongoose.connect(process.env.DATABASE, {
        dbName: 'pokemap',
    })
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => console.error('MongoDB connection error:', err)); 
    return mongoose;
}