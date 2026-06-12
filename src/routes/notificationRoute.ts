import { Router } from "express";
import { savePushNotifController } from "../controllers/notificationController.js";

const router = Router();

router.post('/subscribe', savePushNotifController);

export default router;