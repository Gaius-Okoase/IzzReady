import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import seeds from './bukkas.json' with {type: 'json'};
import config from '../../config/env.js';
import { Bukka } from '../../models/Bukka.js';

const seedWBukkaOwnerId = seeds.map(seed => ({
  ...seed,
  ownerId: new mongoose.Types.ObjectId(),
}))

const seedDb = async () => {
    try {
        await mongoose.connect(config.mongoUri!);
    
        await Bukka.insertMany(seedWBukkaOwnerId);
        console.log('Seeding successful.')
    
        await mongoose.connection.close();
    } catch (error) {
        if (error instanceof Error) console.error(error.message);
        process.exit(1)
    }
}

seedDb();
