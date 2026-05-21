import express from 'express';
import { googleOAuthUrlController, processGoogleCallbackController, registerController } from '../controllers/authController.js';
import { registerValidator } from '../middleware/authValidator.js';

const router = express.Router();

router.post('/register', registerValidator, registerController);
router.get('/google', googleOAuthUrlController);
router.get('/google/callback', processGoogleCallbackController);

export default router;
