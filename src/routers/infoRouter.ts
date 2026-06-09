import express, { Router } from 'express';
import { sendFaq } from '../controllers/infoControllers';
import { errMethodNotAllowed } from '../errorHandling/errorHandling';

const infoRouter: Router = express.Router();

infoRouter.route('/faq')
    .get(sendFaq)
    .all(errMethodNotAllowed);

export default infoRouter;
