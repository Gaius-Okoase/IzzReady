import type mongoose from 'mongoose';

export interface IUser {
  // id: string - Mongoose auto generated
  googleId?: string | undefined;
  name: string;
  email?: string | undefined;
  phoneNumber?: string | undefined;
  password?: string | undefined;
  role: 'customer' | 'owner';
  isProfileComplete: boolean;
  pushNotifToken?: string | undefined;
  refreshToken?: string | undefined;
}

export interface IUserMethod {
  comparePassword: (password: string) => Promise<boolean>;
}

export interface IBukka {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number];
  };
}

export interface IFoodItem {
  bukkaId: mongoose.Types.ObjectId;
  name: string;
  status: 'unavailable' | 'coming_soon' | 'awaiting_confirmation' | 'izz_ready';
  timerExpiry: Date;
}

export interface IQuery {
  userId: mongoose.Types.ObjectId;
  foodItemId: mongoose.Types.ObjectId;
}
