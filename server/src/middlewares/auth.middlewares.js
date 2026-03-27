

// decode JWT token and attach user to req object
import jwt from 'jsonwebtoken';
import { User } from '../models/auth.model.js';

export const verifyToken = async (req, res, next) => {

    const token = req.cookies.accessToken;

    if (!token) {

        return res.status(401).json({ success: false, message: 'Need Login' });
    }
    try {


        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure decoded is an object with id property
        if (typeof decoded === 'string' || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Invalid verification' });
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

export const justDecodeToken = async (req, res, next) => {

    const token = req.cookies.accessToken;
    if (!token) {
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (typeof decoded === 'string' || !decoded.id) {
            return next();
        }
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    } catch (error) {
        return next();
    }
}

