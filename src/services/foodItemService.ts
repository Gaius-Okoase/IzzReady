import { Types } from "mongoose";
import { FoodItem } from "../models/FoodItem.js";
import { Bukka } from "../models/Bukka.js";
import { FoodCatalog } from "../models/FoodCatalog.js";
import { AppError } from "../utils/AppError.js";
// import { IFoodItem } from "../types/types.js";

export const createFoodItem = async (bukkaId: string, foodItemIds: string[]) => {
    // Convert string types to mongoose Type ObjectId
    const bukkaObjectId = new Types.ObjectId(bukkaId);
    const foodItemObjectIds = foodItemIds.map(itemId => new Types.ObjectId(itemId));

    // Confirm bukka exists
    const bukka = await Bukka.findById(bukkaId).lean();
    if (!bukka) throw new AppError (404, 'Bukka not found. Food item creation failed.');

    // Confirm all food item ids are from food catalog collection
    const foodItemsExist = await FoodCatalog.find({_id : {$in : foodItemIds}}).lean();
    if(foodItemsExist.length !== foodItemIds.length) throw new AppError(
        400, 
        'Unkown food items identified. Create custom food item instead.'
    )

    // Create array of update one operations to be passed to mongoose
    const foodItems = foodItemObjectIds.map(itemId => ({
        updateOne: {
            filter: { bukkaId: bukkaObjectId, foodCatalogId: itemId },
            update: { $set: { bukkaId: bukkaObjectId, foodCatalogId: itemId } },
            upsert: true
        }
    }));
    
    // Writing the data to DB using bulkWrite()
    const {upsertedCount, upsertedIds} = await FoodItem.bulkWrite(foodItems)
    const result = { upsertedCount, upsertedIds };
    return result;
}

export const getFoodMenuItems = async (bukkaId: string) => {
    // Confirm bukka exists
    const bukka = await Bukka.findById(bukkaId).lean();
    if (!bukka) throw new AppError (404, 'Bukka not found. Food item creation failed.');

    const foodMenu = await FoodItem.find({bukkaId});

    return foodMenu; 
}