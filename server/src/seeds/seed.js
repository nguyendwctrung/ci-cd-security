import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import connectDatabase from '../config/database.config.js';
import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import { Comment } from '../models/comment.model.js';
import { Follow } from '../models/follow.model.js';
import { Like } from '../models/like.model.js';
import { PostDeleteReason, PostWarning } from '../models/postModeration.model.js';

const seedDatabase = async () => {
    try {
        const db = connectDatabase();
        
        console.log('🌱 Starting database seeding...');

        // Clear existing data (optional - comment if you want to keep existing data)
        await Post.deleteMany({});
        await Comment.deleteMany({});
        await Follow.deleteMany({});
        await Like.deleteMany({});
        await PostDeleteReason.deleteMany({});
        await PostWarning.deleteMany({});

        // Create sample users (assuming these users already exist)
        const users = await User.find().limit(5);
        
        if (users.length < 2) {
            console.log('Need at least 2 users in database. Please create users first.');
            process.exit(1);
        }

        const user1 = users[0];
        const user2 = users[1];
        const user3 = users.length > 2 ? users[2] : users[0];

        // Create sample posts
        const posts = await Post.insertMany([
            {
                user: user1._id,
                content: 'Just caught an amazing Pikachu at the park! 🎉 Anyone else playing?',
                images: [
                    'https://via.placeholder.com/400x300?text=Pikachu+Catch'
                ],
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                isDeleted: false
            },
            {
                user: user2._id,
                content: 'Looking for trading partners! Have a Charizard, need Blastoise.',
                images: [],
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
                isDeleted: false
            },
            {
                user: user1._id,
                content: 'Guide: Best spots to find rare Pokemon in downtown area 📍',
                images: [
                    'https://via.placeholder.com/400x300?text=Pokemon+Map'
                ],
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                isDeleted: false
            },
            {
                user: user3._id,
                content: 'Just reached Level 30! The grind is real! 💪',
                images: [],
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                isDeleted: false
            }
        ]);

        console.log('✅ Posts created:', posts.length);

        // Create sample comments
        const comments = await Comment.insertMany([
            {
                post: posts[0]._id,
                user: user2._id,
                content: 'That\'s awesome! Which park? I want to go there too!',
                likes: 3,
                createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
            },
            {
                post: posts[0]._id,
                user: user3._id,
                content: 'Nice catch! I found a Dragonite there last week.',
                likes: 2,
                createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000)
            },
            {
                post: posts[1]._id,
                user: user1._id,
                content: 'I have a Blastoise! Let\'s trade!',
                likes: 5,
                createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000)
            },
            {
                post: posts[2]._id,
                user: user2._id,
                content: 'Thanks for sharing! This is really helpful.',
                likes: 1,
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
            },
            {
                post: posts[3]._id,
                user: user1._id,
                content: 'Congratulations! Keep grinding! 🚀',
                likes: 4,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
            }
        ]);

        console.log('✅ Comments created:', comments.length);

        // Create sample follows
        const follows = await Follow.insertMany([
            {
                follower: user2._id,
                following: user1._id,
                followedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                isBlocked: false
            },
            {
                follower: user3._id,
                following: user1._id,
                followedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
                isBlocked: false
            },
            {
                follower: user1._id,
                following: user2._id,
                followedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
                isBlocked: false
            },
            {
                follower: user1._id,
                following: user3._id,
                followedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                isBlocked: false
            },
            {
                follower: user2._id,
                following: user3._id,
                followedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                isBlocked: false
            }
        ]);

        console.log('✅ Follows created:', follows.length);

        // Create sample likes
        const likes = await Like.insertMany([
            {
                user: user2._id,
                post: posts[0]._id,
                likedAt: new Date(Date.now() - 22 * 60 * 60 * 1000)
            },
            {
                user: user3._id,
                post: posts[0]._id,
                likedAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
            },
            {
                user: user1._id,
                post: posts[1]._id,
                likedAt: new Date(Date.now() - 11 * 60 * 60 * 1000)
            },
            {
                user: user2._id,
                post: posts[2]._id,
                likedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
            },
            {
                user: user1._id,
                post: posts[3]._id,
                likedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
            },
            {
                user: user3._id,
                post: posts[3]._id,
                likedAt: new Date(Date.now() - 30 * 60 * 1000)
            },
            // Comment likes
            {
                user: user1._id,
                comment: comments[0]._id,
                likedAt: new Date(Date.now() - 19 * 60 * 60 * 1000)
            },
            {
                user: user3._id,
                comment: comments[2]._id,
                likedAt: new Date(Date.now() - 9 * 60 * 60 * 1000)
            }
        ]);

        console.log('✅ Likes created:', likes.length);

        // Create sample post delete reasons
        const deleteReasons = await PostDeleteReason.insertMany([
            {
                post: posts[0]._id,
                reason: 'spam',
                description: 'Duplicate post content',
                deletedBy: users[0]._id,
                deletedAt: new Date()
            }
        ]);

        console.log('✅ Post delete reasons created:', deleteReasons.length);

        // Create sample post warnings
        const warnings = await PostWarning.insertMany([
            {
                post: posts[1]._id,
                warningType: 'misleading',
                description: 'Post contains unverified trading information',
                warningCount: 1,
                warnedBy: users[0]._id,
                warnedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
                isResolved: false
            },
            {
                post: posts[3]._id,
                warningType: 'spam',
                description: 'Excessive self-promotion',
                warningCount: 2,
                warnedBy: users[0]._id,
                warnedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                isResolved: false
            }
        ]);

        console.log('✅ Post warnings created:', warnings.length);

        console.log('🎉 Database seeding completed successfully!');
        console.log(`
        📊 Summary:
        - Posts: ${posts.length}
        - Comments: ${comments.length}
        - Follows: ${follows.length}
        - Likes: ${likes.length}
        - Delete Reasons: ${deleteReasons.length}
        - Warnings: ${warnings.length}
        `);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
