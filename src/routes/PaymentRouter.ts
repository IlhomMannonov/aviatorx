import {Router} from "express";
import {uzPayBot} from "../controller/gameApi/PaymentControlller";


const router: Router = Router();


router.route('/uz-pay-bot-deposit')
    .post(uzPayBot)

export default router;