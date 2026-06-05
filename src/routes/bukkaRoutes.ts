import { Router } from 'express';
import { createBukkaController, getOwnerBukkasController } from '../controllers/bukkaController.js';
import { isOwner } from '../middleware/auth.js';

const router = Router();

router.post('/create', isOwner, createBukkaController);
router.get('/me', isOwner, getOwnerBukkasController);

export default router;
