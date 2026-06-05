import { Bukka } from '../models/Bukka.js';
import { User } from '../models/User.js';
import type { IBukka } from '../types/types.js';
import { AppError } from '../utils/AppError.js';

export const createBukkaService = async (userId: string, bukkaData: IBukka) => {
  const { name, location } = bukkaData;
  const ownerId = userId;

  // Confirm user exists and has an active account
  const user = await User.findById(userId);
  if (!user) throw new AppError(401, 'Unauthorized. User does not exist.');
  if (user.isActive !== true) throw new AppError(403, 'Forbidden');

  // Check if owner already has a bukka
  const ownerExists = await Bukka.findOne({ ownerId }).lean();
  if (ownerExists) throw new AppError(409, 'You already have a registered bukka.');

  // Create bukka
  const bukka = await Bukka.create({ ownerId, name, location });

  // Mark user proile as complete
  if (user.isProfileComplete === false) user.isProfileComplete = true;
  user.save();

  return bukka;
};

export const getOwnerBukkas = async (ownerId: string) => {
  const bukkas = await Bukka.find({ ownerId });

  if (bukkas.length === 0)
    throw new AppError(404, 'You have no bukka. Create a bukka to continue.');

  return bukkas;
};
