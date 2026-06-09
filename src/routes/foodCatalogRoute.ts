import { Router } from 'express';
import { getFoodCatalogController } from '../controllers/foodCatalogController.js';

const router = Router();

router.get('/', getFoodCatalogController);

export default router;
