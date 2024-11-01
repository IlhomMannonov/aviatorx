import {Router} from 'express';
import {sports, update_wallet, user_amount, user_data} from '../controller/gameApi/GameApiController';
import {verifyToken} from '../middlewares/Security'
import {transactions} from "../controller/gameApi/PaymentControlller";

const router: Router = Router();

router.route('/sports')
    .get(sports);

router.route('/user-amount/:id')
    .get(verifyToken, user_amount)

router.route('/update-wallet')
    .post(verifyToken, update_wallet)

router.route('/user-data/:id')
    .get(user_data)

router.route('/transactions/:id').get(transactions)

export default router;
