import express from 'express';
import {
  getUserController,
  googleOAuthUrlController,
  loginController,
  logoutController,
  processGoogleCallbackController,
  registerController,
  tokenRotationController,
} from '../controllers/authController.js';
import { loginValidator, registerValidator } from '../middleware/authValidator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerValidator, registerController);
router.get('/google', googleOAuthUrlController);
router.get('/google/callback', processGoogleCallbackController);
router.post('/login', loginValidator, loginController);
router.post('/logout', authenticate, logoutController);
router.post('/refresh-token', tokenRotationController);
router.get('/me', authenticate, getUserController);

export default router;
