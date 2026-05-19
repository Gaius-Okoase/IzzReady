/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import type { IBukka } from '../types/types.js';

const bukkaSchema = new mongoose.Schema<IBukka>(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please enter your Bukka name'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index on location
bukkaSchema.index({ location: '2dsphere' });

bukkaSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    (ret as any)._id = undefined;
    (ret as any).__v = undefined;
  },
});

export const Bukka = mongoose.model('Bukka', bukkaSchema);
