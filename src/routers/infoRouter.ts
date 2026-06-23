import express, { Router } from 'express';
import { sendFaq } from '../controllers/infoControllers';
import { errHandleMethodNotAllowed } from '../errorHandling/errorHandling';

const infoRouter: Router = express.Router();

infoRouter.route('/faq')
    .get(sendFaq)
    .all(errHandleMethodNotAllowed);

export default infoRouter;
