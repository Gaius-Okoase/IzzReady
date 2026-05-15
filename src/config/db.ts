import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose, {MongooseError} from 'mongoose';
import config from './env.js';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri!, {
            maxPoolSize: 20,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 6000,
            socketTimeoutMS: 5000,
            autoIndex: !config.isProduction,
        })
        console.log(`MongoDB connected successfully`)
    } catch (error) {
        error instanceof MongooseError 
        ? console.error('Failed to connect to MongoDB:', error.message) 
        : console.error('Failed to connect to MongoDB', error);
        process.exit(1)
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log(`MongoDB discconected successfully`);
    } catch (error) {
        error instanceof MongooseError 
        ? console.error('Failed to disconnect MongoDB:', error.message) 
        : console.error('Failed to disconnect MongoDB', error);
        process.exit(1);        
    }
}