import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const generateAccessToken = (id: string, role: 'customer' | 'owner') => {
  return jwt.sign({ id, role }, config.accessSec!, { expiresIn: '5m' });
};

export const generateRefreshToken = (
  id: string,
  role: 'customer' | 'owner'
) => {
  return jwt.sign({ id, role }, config.refreshSec!, { expiresIn: '30d' });
};
