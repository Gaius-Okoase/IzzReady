/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import type { IUser, IUserMethod } from '../types/types.js';

const userSchema = new mongoose.Schema<IUser, mongoose.Model<IUser>, IUserMethod>(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      unique: true,
      sparse: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      minLength: [6, 'Password must be at least 6 characters.'],
      select: false,
    },
    role: {
      type: String,
      lowercase: true,
      enum: ['owner', 'customer'],
      required: true,
    },
    isProfileComplete: {
      type: Boolean,
      required: true,
      default: true,
    },
    pushNotifToken: {
      type: String,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true
    },
    lastLoginAt: {
      type: Date,
      default: () => new Date(),
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// pre-save hook
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// comparePassword method
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  const pw = this.password as string;
  return await bcrypt.compare(enteredPassword, pw);
};

// get virtual id and strip out unneeded fields when send document as JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    (ret as any)._id = undefined;
    (ret as any).__v = undefined;
    (ret as any).password = undefined;
    (ret as any).refreshToken = undefined;
    (ret as any).googleId = undefined;
  },
});

export const User = mongoose.model('User', userSchema);
