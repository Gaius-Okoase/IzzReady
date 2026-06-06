import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import config from '../../config/env.js';
import { FoodCatalog } from '../../models/FoodCatalog.js';
import seeds from './foodCatalog.json' with { type: 'json' };
import mongoose from 'mongoose';

// Extract the food items from catalog
const foodCatalog = seeds.foodCatalog;

// Extract only food items with  image url
const foods = foodCatalog.filter((food) => food.imageUrl);

// Store food items in the DB
const seedDb = async () => {
  try {
    await mongoose.connect(config.mongoUri!);
    console.log(`DB connected to seed with food catalog`);

    await FoodCatalog.deleteMany({});
    console.log(`Deleted existing food catalog`);

    await FoodCatalog.insertMany(foods);
    console.log(`Seeded DB with food catalog`);

    await mongoose.connection.close();
    console.log(`Closed the mongoose connection`);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    process.exit(1);
  }
};

seedDb();
