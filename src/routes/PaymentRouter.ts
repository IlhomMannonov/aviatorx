import {Router} from "express";
import {payment_methods, uzPayBot} from "../controller/gameApi/PaymentControlller";


const router: Router = Router();


router.route('/uz-pay-bot-deposit')
    .post(uzPayBot)
router.route("/payment-methods")
    .get(payment_methods)

export default router;