import { Router } from 'express';
import {
  createBukkaController,
  deleteBukkaController,
  getBukkaDetailsController,
  getOwnerBukkasController,
  getSurroundingBukkasController,
  updateBukkaDetailsController,
} from '../controllers/bukkaController.js';
import { isOwner } from '../middleware/auth.js';
import { coordinatesValidator } from '../middleware/bukkaValidator.js';

const router = Router();

router.get('/', coordinatesValidator, getSurroundingBukkasController);
router.post('/create', isOwner, createBukkaController);
router.get('/me', isOwner, getOwnerBukkasController);
router.get('/:bukkaId', getBukkaDetailsController);
router.patch('/:bukkaId', isOwner, updateBukkaDetailsController);
router.delete('/:bukkaId', isOwner, deleteBukkaController);

export default router;
