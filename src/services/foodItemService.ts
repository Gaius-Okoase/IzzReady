import { Types } from "mongoose";
import { FoodItem } from "../models/FoodItem.js";
import { Bukka } from "../models/Bukka.js";
import { AppError } from "../utils/AppError.js";
// import { IFoodItem } from "../types/types.js";

export const createFoodItem = async (bukkaId: string, foodItemIds: string[]) => {
    // Convert string types to mongoose Type ObjectId
    const bukkaObjectId = new Types.ObjectId(bukkaId);
    const foodItemObjectIds = foodItemIds.map(itemId => new Types.ObjectId(itemId));

    // Confirm bukka exists
    const bukka = await Bukka.findById(bukkaId);
    if (!bukka) throw new AppError (404, 'Bukka not found. Food item creation failed.');

    // Create array of update one operations to be passed to mongoose
    const foodItems = foodItemObjectIds.map(itemId => ({
        updateOne: {
            filter: {bukkaObjectId, foodCatalogId: itemId},
            update: { $set: { bukkaObjectId, foodCatalogId: itemId } },
            upsert: true
        }
    }));
    
    // Writing the data to DB using bulkWrite()
    const result = await FoodItem.bulkWrite(foodItems)
    return result;
}
