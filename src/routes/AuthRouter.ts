import {Router} from 'express';
import {registerOneClick} from '../controller/auth/AuthController';

const router: Router = Router();

router.route('/one-click-register')
    .post(registerOneClick);

export default router;
