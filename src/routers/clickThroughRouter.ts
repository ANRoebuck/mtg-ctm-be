import express, { Router } from 'express';
import { postClickThrough, sendClickThroughsBySeller, sendClickThroughsByCard, deleteClickThroughs } from '../controllers/clickThroughControllers';
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

export default clickThroughRouter;
