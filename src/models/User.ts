/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import type { IUser, IUserMethod } from '../types/types.js';

const userSchema = new mongoose.Schema<IUser, mongoose.Model<IUser>, IUserMethod>(
  {
    googleId: {
      type: String,
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
    },
    phoneNumber: {
      type: String,
      trim: true,
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
      default: false,
    },
    pushNotifToken: {
      type: [String],
    },
    refreshToken: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    lastLoginAt: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
      default: null,
    },
    lastFailedLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });

// pre-save hook
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// comparePassword method
userSchema.methods.comparePassword = async function (password: string) {
  const pw = this.password as string;
  return await bcrypt.compare(password, pw);
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
    (ret as any).pushNotifToken = undefined;
  },
});

export const User = mongoose.model('User', userSchema);
