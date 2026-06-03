import z from 'zod';

export const createFoodItemsSchema = z.object({
    foodItemIds: z.array(z.string()).min(1, "Must contain at least one food item.")
});