import {Router} from 'express';
import {activeCountry, getActiveAllCurrency} from "../controller/utilsController/UtilsController";

const router: Router = Router();

router.route('/country').get(activeCountry);
router.route('/currency').get(getActiveAllCurrency);

export default router;
