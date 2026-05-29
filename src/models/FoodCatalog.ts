/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import type { IFoodCatalog } from '../types/types.js';

const foodCatalogSchema = new mongoose.Schema<IFoodCatalog>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

foodCatalogSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    (ret as any)._id = undefined;
    (ret as any).__v = undefined;
  },
});

export const FoodCatalog = mongoose.model('FoodCatalog', foodCatalogSchema);
