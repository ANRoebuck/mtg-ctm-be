import express, { Router } from 'express';
import { postClickThrough, sendClickThroughsBySeller, sendClickThroughsByCard, deleteClickThroughs } from '../controllers/clickThroughControllers';
import { errMethodNotAllowed } from '../errorHandling/errorHandling';

const clickThroughRouter: Router = express.Router();

clickThroughRouter.route('/')
    .post(postClickThrough)
    .delete(deleteClickThroughs)
    .all(errMethodNotAllowed);

clickThroughRouter.route('/sellers')
    .get(sendClickThroughsBySeller)
    .all(errMethodNotAllowed);

clickThroughRouter.route('/cards')
    .get(sendClickThroughsByCard)
    .all(errMethodNotAllowed);

export default clickThroughRouter;
