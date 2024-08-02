import { Router } from 'express';
import { setWebhook } from '../controller/telegram-bot/MainBot';

const router = Router();

router.post('/telegram', setWebhook);

export default router;
