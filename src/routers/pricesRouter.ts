import express, { Router } from 'express';
import { sendPrices, sendSellers, sendModelsTest } from '../controllers/pricesControllers';
import { errHandleMethodNotAllowed } from "../errorHandling/errorHandling";

const pricesRouter: Router = express.Router();

pricesRouter.route('/')
    .post(sendPrices)
    .get(sendSellers)
    .all(errHandleMethodNotAllowed);

pricesRouter.route('/test-all-models')
    .get(sendModelsTest)
    .all(errHandleMethodNotAllowed);


export default pricesRouter;
