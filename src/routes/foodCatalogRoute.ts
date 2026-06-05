import { Router } from 'express';
import { getFoodCatalogController } from '../controllers/foodCatalog.js';

const router = Router();

router.get('/', getFoodCatalogController);

export default router;
