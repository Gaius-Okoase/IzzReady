import { Router } from 'express';
import {
  createBukkaController,
  deleteBukkaController,
  getBukkaDetailsController,
  getOwnerBukkasController,
  updateBukkaDetailsController,
} from '../controllers/bukkaController.js';
import { isOwner } from '../middleware/auth.js';

const router = Router();

router.post('/create', isOwner, createBukkaController);
router.get('/me', isOwner, getOwnerBukkasController);
router.get('/:bukkaId', getBukkaDetailsController);
router.patch('/:bukkaId', isOwner, updateBukkaDetailsController);
router.delete('/:bukkaId', isOwner, deleteBukkaController);

export default router;
