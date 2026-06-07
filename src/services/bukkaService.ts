import { Bukka } from '../models/Bukka.js';
import { User } from '../models/User.js';
import type { IBukka, IUpdateBukka } from '../types/types.js';
import { AppError } from '../utils/AppError.js';

export const createBukkaService = async (ownerId: string, bukkaData: IBukka) => {
  const { name, location } = bukkaData;

  // Find user's account
  const user = await User.findById(ownerId);
  if (!user) throw new AppError(401, 'Unauthorized. User does not exist.');

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

export const getBukkaDetails = async (bukkaId: string) => {
  const bukka = await Bukka.findOne({ _id: bukkaId }).select('-ownerId');

  if (!bukka) throw new AppError(404, 'Bukka not found.');

  return bukka;
};

export const updateBukkaDetails = async (
  ownerId: string,
  bukkaId: string,
  bukkaData: IUpdateBukka
) => {
  // Find bukka and update
  const bukka = await Bukka.findOneAndUpdate({ _id: bukkaId, ownerId }, bukkaData, {
    returnDocument: 'after',
  });

  if (!bukka) throw new AppError(404, 'Bukka not found.');

  return bukka;
};

export const deleteBukka = async (ownerId: string, bukkaId: string) => {
  // Find bukka and delete it
  await Bukka.findOneAndDelete({ _id: bukkaId, ownerId });

  return;
};

export const getSurroundingBukkas = async (lon: number, lat: number) => {
  console.log(`lon:`, lon, 'lat:', lat)
  const bukkas = await Bukka.find({ location: {
    $nearSphere: {
      $geometry : {
        type: "Point",
        coordinates: [lon, lat]
      },
      $maxDistance: 1500
    }
  }}).select('-ownerId')

  return bukkas;
}