import {Router} from 'express';
import {player_info} from '../controller/gameApi/AviatrxController';

const router: Router = Router();

router.route('/game/aviatrx/playerInfo')
    .post(player_info);

export default router;
