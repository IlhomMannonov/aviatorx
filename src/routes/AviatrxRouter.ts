import {Router} from 'express';
import {game_round} from '../controller/gameApi/AviatrxController';

const router: Router = Router();

router.route('/game/round')
    .get(game_round);

export default router;
