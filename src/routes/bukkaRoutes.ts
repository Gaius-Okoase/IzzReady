import { Router } from 'express';
import { bukkaSetupController } from '../controllers/bukkaController.js';

const router = Router();

router.post('/setup', bukkaSetupController);

export default router;
