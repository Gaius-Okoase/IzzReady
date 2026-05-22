/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import type { IQueue } from '../types/types.js';

const querySchema = new mongoose.Schema<IQueue>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    foodItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

querySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    (ret as any)._id = undefined;
    (ret as any).__v = undefined;
  },
});

export const Query = mongoose.model('Query', querySchema);
