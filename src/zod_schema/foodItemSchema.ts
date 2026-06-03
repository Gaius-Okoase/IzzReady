import z from 'zod';

export const foodItemIdSchema = z.object({
    foodItemIds: z.array(z.string()).min(1, "Must contain at least one food item.")
});