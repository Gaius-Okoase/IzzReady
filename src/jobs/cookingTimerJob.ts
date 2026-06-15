import cron from 'node-cron';
import { updateFoodItem } from '../services/foodItemService.js';
import { FoodItem } from '../models/FoodItem.js';

// Set a lock for when a job is still running
let isRunning = false;

cron.schedule('* * * * *', async () => {
  //Cehck if a job is still running before running anew
  if (isRunning) return;
  console.log(`Cron Job running at ${new Date().toISOString()}`);
  // Flag is running as true when a job starts running
  isRunning = true;

  try {
    // Set current date
    const date = new Date();

    // Find all ready food items
    const readyFoodItems = await FoodItem.find({ cookingTimer: { $lte: date }, status: 'cooking' });

    // Return if no food item is ready
    if (readyFoodItems.length === 0) return;

    // Extract _id and bukkaId from each collection
    const args = readyFoodItems.map((foodItem) => ({
      bukkaId: foodItem.bukkaId.toString(),
      itemId: foodItem._id.toString(),
      itemData: { status: 'izz_ready' as const },
    }));

    try {
      await Promise.all(args.map((arg) => updateFoodItem(arg.bukkaId, arg.itemId, arg.itemData)));
    } catch (error) {
      console.error('An error occured: ', error);
    }
  } finally {
    isRunning = false;
  }
});
