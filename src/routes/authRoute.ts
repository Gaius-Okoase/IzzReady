import express from 'express';
import { googleOAuthUrlController, loginController, processGoogleCallbackController, registerController } from '../controllers/authController.js';
import { loginValidator, registerValidator } from '../middleware/authValidator.js';

const router = express.Router();

router.post('/register', registerValidator, registerController);
router.get('/google', googleOAuthUrlController);
router.get('/google/callback', processGoogleCallbackController);
router.post('/login', loginValidator, loginController);

export default router;
