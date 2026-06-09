import { FoodCatalog } from '../models/FoodCatalog.js';

export const getFoodCatalog = async () => {
  const foodCatalog = await FoodCatalog.find({}).select('name imageUrl id category');

  return foodCatalog;
};
