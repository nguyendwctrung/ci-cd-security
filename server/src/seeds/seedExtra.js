import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import connectDatabase from '../config/database.config.js';
import MapPin from '../models/mapPin.model.js';
import { PendingUser } from '../models/pendingUser.model.js';
import { OTPResetPassword } from '../models/otpResetPassword.model.js';
import { hashPassword } from '../helpers/auth.helper.js';
import { User } from '../models/user.model.js';

const seedPinData = async () => {
    try {
        const db = connectDatabase();
        
        console.log('🌱 Starting map pins, pending users and OTP seed...');

        // Clear existing data (optional)
        await MapPin.deleteMany({});
        await PendingUser.deleteMany({});
        await OTPResetPassword.deleteMany({});

        // Get existing users
        const users = await User.find().limit(3);
        
        if (users.length < 1) {
            console.log('❌ Need at least 1 user in database. Please create users first.');
            process.exit(1);
        }

        const user1 = users[0];
        const user2 = users.length > 1 ? users[1] : users[0];
        const user3 = users.length > 2 ? users[2] : users[0];

        // ===== MapPin Data (Pokemon Locations) =====
        const mapPins = await MapPin.insertMany([
            // Pikachu locations
            {
                pokemonID: 25,
                userID: user1._id,
                latitude: 10.8231,
                longitude: 106.6830,
                status: true,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                pokemonID: 25,
                userID: user2._id,
                latitude: 10.7769,
                longitude: 106.7009,
                status: true,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
            },
            // Charmander locations
            {
                pokemonID: 4,
                userID: user3._id,
                latitude: 10.8215,
                longitude: 106.6912,
                status: false,
                createdAt: new Date(Date.now() - 30 * 60 * 1000)
            },
            {
                pokemonID: 4,
                userID: user1._id,
                latitude: 10.7575,
                longitude: 106.6761,
                status: true,
                createdAt: new Date(Date.now() - 15 * 60 * 1000)
            },
            // Squirtle locations
            {
                pokemonID: 7,
                userID: user2._id,
                latitude: 10.7282,
                longitude: 106.7331,
                status: true,
                createdAt: new Date(Date.now() - 45 * 60 * 1000)
            },
            {
                pokemonID: 7,
                userID: user3._id,
                latitude: 10.8036,
                longitude: 106.6638,
                status: true,
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
            },
            // Bulbasaur locations
            {
                pokemonID: 1,
                userID: user1._id,
                latitude: 10.7538,
                longitude: 106.7244,
                status: true,
                createdAt: new Date(Date.now() - 50 * 60 * 1000)
            },
            {
                pokemonID: 1,
                userID: user2._id,
                latitude: 10.8050,
                longitude: 106.6505,
                status: false,
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
            },
            // Dragonite location
            {
                pokemonID: 149,
                userID: user3._id,
                latitude: 10.7965,
                longitude: 106.7275,
                status: true,
                createdAt: new Date(Date.now() - 10 * 60 * 1000)
            },
            // Mewtwo location (rare)
            {
                pokemonID: 150,
                userID: user1._id,
                latitude: 10.8145,
                longitude: 106.6527,
                status: true,
                createdAt: new Date(Date.now() - 5 * 60 * 1000)
            }
        ]);

        console.log('✅ MapPins created:', mapPins.length);

        // ===== PendingUser Data =====
        const hashedPassword1 = await hashPassword('TestPass123');
        const hashedPassword2 = await hashPassword('SecurePass456');
        const hashedPassword3 = await hashPassword('AdminPass789');

        const pendingUsers = await PendingUser.insertMany([
            {
                email: 'pending1@example.com',
                password: hashedPassword1,
                username: 'newtrainer1',
                profile: {
                    firstName: 'John',
                    lastName: 'Doe'
                },
                otp: '123456',
                role: 'user',
                otpExpires: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes remaining
                attempts: 1,
                recreation: 0,
                createdAt: new Date(Date.now() - 2 * 60 * 1000)
            },
            {
                email: 'pending2@example.com',
                password: hashedPassword2,
                username: 'newtrainer2',
                profile: {
                    firstName: 'Jane',
                    lastName: 'Smith'
                },
                otp: '654321',
                role: 'user',
                otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes remaining
                attempts: 0,
                recreation: 1,
                createdAt: new Date(Date.now() - 5 * 60 * 1000)
            },
            {
                email: 'pendingadmin@example.com',
                password: hashedPassword3,
                username: 'admintrainer',
                profile: {
                    firstName: 'Admin',
                    lastName: 'User'
                },
                otp: '789012',
                role: 'admin',
                otpExpires: new Date(Date.now() + 9 * 60 * 1000), // 9 minutes remaining
                attempts: 0,
                recreation: 0,
                createdAt: new Date(Date.now() - 1 * 60 * 1000)
            }
        ]);

        console.log('✅ PendingUsers created:', pendingUsers.length);

        // ===== OTPResetPassword Data =====
        const otpResetPasswords = await OTPResetPassword.insertMany([
            {
                email: 'user1@example.com',
                otp: '111111',
                otpExpires: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes remaining
                attempts: 0,
                createdAt: new Date(Date.now() - 2 * 60 * 1000)
            },
            {
                email: 'user2@example.com',
                otp: '222222',
                otpExpires: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes remaining
                attempts: 1,
                createdAt: new Date(Date.now() - 7 * 60 * 1000)
            },
            {
                email: 'user3@example.com',
                otp: '333333',
                otpExpires: new Date(Date.now() - 5 * 60 * 1000), // Already expired
                attempts: 3,
                createdAt: new Date(Date.now() - 15 * 60 * 1000)
            }
        ]);

        console.log('✅ OTP Reset Passwords created:', otpResetPasswords.length);

        console.log('🎉 Seeding completed successfully!');
        console.log(`
        📊 Summary:
        - MapPins: ${mapPins.length}
        - PendingUsers: ${pendingUsers.length}
        - OTP Reset Passwords: ${otpResetPasswords.length}
        `);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedPinData();
