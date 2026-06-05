import type mongoose from 'mongoose';

export interface IUser {
  // id: string - Mongoose auto generated
  googleId?: string | undefined;
  name: string;
  email?: string | undefined;
  phoneNumber?: string | undefined;
  password?: string | undefined;
  role: 'customer' | 'owner';
  isProfileComplete?: boolean | undefined;
  pushNotifToken?: string | undefined;
  refreshToken?: string | undefined;
  isActive?: boolean;
  lastLoginAt?: Date;
}

export interface IUserMethod {
  comparePassword: (password: string) => Promise<boolean>;
}

export interface IBukka {
  ownerId?: mongoose.Types.ObjectId;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number];
  };
}

export interface IUpdateBukka {
  name?: string;
  location?: {
    type: 'Point';
    coordinates: [number];
  };
}

export interface IFoodItem {
  bukkaId: mongoose.Types.ObjectId;
  foodCatalogId?: mongoose.Types.ObjectId | undefined;
  name?: string | undefined;
  imageUrl?: string | undefined;
  isCustom: boolean;
  status: 'unavailable' | 'cooking' | 'awaiting_confirmation' | 'izz_ready';
  cookingTimer: Date;
}

export interface IQueue {
  userId: mongoose.Types.ObjectId;
  foodItemId: mongoose.Types.ObjectId;
}

export interface IFoodCatalog {
  name: string;
  imageUrl?: string;
  category: string;
  // createdAt: Date - Mongoose auto generated
  // updatedAt: Date - Mongoose auto generated
}

export interface LoginDetails {
  phoneNumber: string;
  password: string;
}

export interface DecodedToken {
  id: string;
  role: 'owner' | 'customer';
  identifier: string;
}
