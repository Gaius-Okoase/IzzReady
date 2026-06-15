import { Queue } from "../models/Queue.js";
import { FoodItem } from "../models/FoodItem.js";
import { AppError } from "../utils/AppError.js";

export const joinQueue = async (userId: string, itemId: string) => {
    // Check that food item exists
    const foodItem = await FoodItem.findById(itemId);
    if (!foodItem) throw new AppError(404, 'Food item does not exist')
    
    // Check if user is in queue already
    const queueCheck = await Queue.findOne({userId, foodItemId: itemId}).lean();
    if (queueCheck) throw new AppError (409, `You're on queue already for this item.`);

    // Confirtm the food's status
    if (foodItem.status !== 'cooking') throw new AppError (403, `You can't join the queue for this item.`)    

   // Create the queue entry
   const queue = await Queue.create({
    foodItemId: itemId,
    userId
   });

   return queue.toObject();
}

export const leaveQueue = async (userId: string, itemId: string) => {
  // Check that food item exists
  const foodItem = await FoodItem.findById(itemId);
  if (!foodItem) throw new AppError(404, 'Food item does not exist')
  
  // Check if user is in queue
  const queueCheck = await Queue.findOne({userId, foodItemId: itemId}).lean();
  if (!queueCheck) throw new AppError (404, `You're not on queue for this item.`);    

  // Delete the queue entry
  await Queue.findByIdAndDelete(queueCheck._id);

  return;
}

export const getQueCount = async (itemId: string) => {
  // Check that food item exists
  const foodItem = await FoodItem.findById(itemId);
  if (!foodItem) throw new AppError(404, 'Food item does not exist')
  
  // Count the number of queue entries for food item
  const count = await Queue.countDocuments({foodItemId: itemId});

  return {queueCount: count};
}