import {Router} from 'express';
import {sports} from '../controller/gameApi/GameApiController';

const router: Router = Router();

router.route('/sports')
    .get(sports);


export default router;
