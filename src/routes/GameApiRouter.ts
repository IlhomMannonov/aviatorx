import {Router} from 'express';
import {sports, update_wallet, user_amount} from '../controller/gameApi/GameApiController';
import {verifyToken} from '../middlewares/Security'

const router: Router = Router();

router.route('/sports')
    .get(sports);

router.route('/user-amount/:id')
    .get(verifyToken, user_amount)

router.route('/update-wallet')
    .post(verifyToken, update_wallet)

export default router;
