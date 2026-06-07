import mongoose from 'mongoose';
import type { IFoodItem } from '../types/types.js';

const foodItemSchema = new mongoose.Schema<IFoodItem>(
  {
    bukkaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bukka',
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodCatalog',
    },
    name: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['unavailable', 'cooking', 'awaiting_confirmation', 'izz_ready'],
      default: 'unavailable',
    },
    cookingTimer: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
foodItemSchema.index({ item: 1 }, { sparse: true });

foodItemSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ret as any)._id = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ret as any).__v = undefined;
  },
});

export const FoodItem = mongoose.model('FoodItem', foodItemSchema);
