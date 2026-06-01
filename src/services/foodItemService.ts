import mongoose from "mongoose";
import { FoodItem } from "../models/FoodItem.js";
// import { IFoodItem } from "../types/types.js";

export const createFoodItem = async (bukkaId: mongoose.Types.ObjectId, foodItemIds: mongoose.Types.ObjectId[]) => {
    // Create array of update one operations to be passed to mongoose
    const foodItems = foodItemIds.map(itemId => ({
        updateOne: {
            filter: {bukkaId, foodCatalogId: itemId},
            update: { $set: { bukkaId, foodCatalogId: itemId } },
            upsert: true
        }
    }));
    
    // Writing the data to DB using bulkWrite()
    const result = await FoodItem.bulkWrite(foodItems)
    return result;
}
