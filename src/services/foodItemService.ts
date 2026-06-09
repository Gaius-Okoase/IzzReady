import { Types } from 'mongoose';
import { FoodItem } from '../models/FoodItem.js';
import { Bukka } from '../models/Bukka.js';
import { FoodCatalog } from '../models/FoodCatalog.js';
import { AppError } from '../utils/AppError.js';
import type { ICustomFoodItem, IUpdateFoodItem } from '../types/types.js';
// import { IFoodItem } from "../types/types.js";

export const createFoodItem = async (bukkaId: string, foodItemIds: string[]) => {
  // Confirm bukka exists
  const bukka = await Bukka.findById(bukkaId).lean();
  if (!bukka) throw new AppError(404, 'Bukka not found. Food item creation failed.');

  // Convert string types to mongoose Type ObjectId
  const bukkaObjectId = new Types.ObjectId(bukkaId);
  const foodItemObjectIds = foodItemIds.map((itemId) => new Types.ObjectId(itemId));

  // Confirm all food item ids are from food catalog collection
  const foodItemsExist = await FoodCatalog.find({ _id: { $in: foodItemIds } }).lean();
  if (foodItemsExist.length !== foodItemIds.length)
    throw new AppError(400, 'Unkown food items identified. Create custom food item instead.');

  // Create array of update one operations to be passed to mongoose
  const foodItems = foodItemObjectIds.map((itemId) => ({
    updateOne: {
      filter: { bukkaId: bukkaObjectId, item: itemId },
      update: { $set: { bukkaId: bukkaObjectId, item: itemId } },
      upsert: true,
    },
  }));

  // Writing the data to DB using bulkWrite()
  const { upsertedCount, upsertedIds } = await FoodItem.bulkWrite(foodItems);
  const result = { upsertedCount, upsertedIds };
  return result;
};

export const createCustomFoodItem = async (bukkaId: string, itemData: ICustomFoodItem) => {
  // Confirm bukka exists
  const bukka = await Bukka.findById(bukkaId).lean();
  if (!bukka) throw new AppError(404, 'Bukka not found. Food item creation failed.');

  // Destructure
  const { name, imageUrl } = itemData;

  const item = await FoodItem.create({
    bukkaId,
    name,
    imageUrl,
    category: 'others',
    isCustom: true,
  });

  return await item.populate('bukkaId', 'name');
};

export const getFoodMenuItems = async (bukkaId: string) => {
  // Confirm bukka exists
  const bukka = await Bukka.findById(bukkaId).lean();
  if (!bukka) throw new AppError(404, 'Bukka does not exist.');

  const foodMenu = await FoodItem.find({ bukkaId })
    .populate('item', 'name imageUrl category')
    .populate('bukkaId', 'name');

  return foodMenu;
};

export const updateFoodItem = async (
  bukkaId: string,
  itemId: string,
  itemData: IUpdateFoodItem
) => {
  const { name, imageUrl, status, cookingTimer } = itemData;
  // Find food item
  const item = await FoodItem.findOne({ _id: itemId, bukkaId });
  if (!item) throw new AppError(404, 'Food item does not exist.');

  // Check if food item is custom before updating name or image
  if (name || imageUrl) {
    if (!item.isCustom) throw new AppError(401, `Can't change the detail of custom food item.`);

    item.name = name;
    item.imageUrl = imageUrl;
  }

  // Clear cooking timer for unavailable and izz_ready
  if (status === 'unavailable' || status === 'izz_ready') {
    item.status = status;
    item.cookingTimer = null;
  }

  // Allow 'cooking' status only if 'cookingTimer' is set
  if (!cookingTimer && status === 'cooking') throw new AppError(400, 'Please set a cooking timer.');

  // Update 'cooking' status confirming status is 'cooking'
  if (cookingTimer && status === 'cooking') {
    item.status = status;
    item.cookingTimer = cookingTimer;
  }

  await item.save();

  return (await item.populate('item', 'name imageUrl category')).populate('bukkaId', 'name');
};

export const deleteFoodItem = async (bukkaId: string, itemId: string) => {
  await FoodItem.findOneAndDelete({ _id: itemId, bukkaId });

  return;
};
