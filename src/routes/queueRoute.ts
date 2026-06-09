import { Router } from "express";
import { joinQueueController, leaveQueueController, getQueCountController } from "../controllers/queueController.js";
import { isOwner } from "../middleware/auth.js";

const router = Router({mergeParams: true});

router.post('/', joinQueueController);
router.delete('/', leaveQueueController);
router.get('/count', isOwner, getQueCountController);

export default router;