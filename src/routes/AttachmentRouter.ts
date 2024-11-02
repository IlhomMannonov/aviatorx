import {Router} from 'express';
import {registerOneClick} from '../controller/auth/AuthController';
import {getFile, uploadFile} from "../controller/attachment/AttachmentController";

const router: Router = Router();

router.route('/upload-file')
    .post(uploadFile);

router.route('/get-file/:id')
    .get(getFile);

export default router;
