import z from 'zod';

export const FoodItemIdsSchema = z.object({
  foodItemIds: z.array(z.string()).min(1, 'Must contain at least one food item.'),
});

export const CustomFoodItemSchema = z.object({
  name: z
    .string('Food name must be a string')
    .min(1, 'Food name cannot be an empty string')
    .max(50, 'Food name too long.'),
  imageUrl: z.optional(
    z.url({
      protocol: /^https?$/,
      hostname: /^res\.cloudinary\.com$/,
    })
  ),
});

export const FoodItemDetailsSchema = z.object({
  name: z.optional(
    z
      .string('Food name must be a string')
      .min(1, 'Food name cannot be an empty string')
      .max(50, 'Food name too long.')
  ),
  imageUrl: z.optional(
    z.url({
      protocol: /^https?$/,
      hostname: /^res\.cloudinary\.com$/,
    })
  ),
});

export const FoodItemStatusSchema = z.object({
  status: z.optional(
    z.literal(['unavailable', 'cooking', 'izz_ready'], 'Select a valid food status')
  ),
  cookingTimer: z.optional(z.date()),
});

export const FoodMenuQuerySchema = z.object({
  name: z.optional(
    z
      .string('Food name must be a string')
      .min(1, 'Food name cannot be an empty string')
      .max(50, 'Food name too long.')
  ),
  category: z.optional(
    z.string().min(1, 'Category must not be empty an empty string.')
  ),
  status: z.optional(
    z.literal(['unavailable', 'cooking', 'izz_ready'], 'Select a valid food status')
  ),  
})