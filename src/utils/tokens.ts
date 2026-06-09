import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const generateAccessToken = (id: string, role: 'customer' | 'owner', identifier: string) => {
  return jwt.sign({ id, role, identifier }, config.accessSec!, {
    expiresIn: '20m',
  });
};

export const generateRefreshToken = (
  id: string,
  role: 'customer' | 'owner',
  identifier: string
) => {
  return jwt.sign({ id, role, identifier }, config.refreshSec!, {
    expiresIn: '30d',
  });
};
