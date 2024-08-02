import { Router } from 'express';
import { getAllUsers, createUser } from '../controller/UserController';

const router: Router = Router();

router.route('/api/v1')
    .get(getAllUsers)
    .post(createUser);

export default router;
