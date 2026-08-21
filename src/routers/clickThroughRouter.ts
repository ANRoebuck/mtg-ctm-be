import express, { Router } from 'express';
import { postClickThrough, sendClickThroughsBySeller, sendClickThroughsByCard, sendClickThroughsCardsBySeller, deleteClickThroughs } from '../controllers/clickThroughControllers';
import { errHandleMethodNotAllowed } from '../errorHandling/errorHandling';

const clickThroughRouter: Router = express.Router();

clickThroughRouter.route('/')
    .post(postClickThrough)
    .delete(deleteClickThroughs)
    .all(errHandleMethodNotAllowed);

clickThroughRouter.route('/sellers')
    .get(sendClickThroughsBySeller)
    .all(errHandleMethodNotAllowed);

clickThroughRouter.route('/cards')
    .get(sendClickThroughsByCard)
    .all(errHandleMethodNotAllowed);

clickThroughRouter.route('/cards-by-seller')
    .get(sendClickThroughsCardsBySeller)
    .all(errHandleMethodNotAllowed);

export default clickThroughRouter;
