import mongoose from "mongoose";
import { FoodItem } from "../models/FoodItem.js";
import { Bukka } from "../models/Bukka.js";
import { AppError } from "../utils/AppError.js";
// import { IFoodItem } from "../types/types.js";

export const createFoodItem = async (bukkaId: mongoose.Types.ObjectId, foodItemIds: mongoose.Types.ObjectId[]) => {
    // Confirm bukka exists
    const bukka = await Bukka.findById(bukkaId);
    if (!bukka) throw new AppError (404, 'Bukka not found. Food item creation failed.');

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
