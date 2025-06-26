import express, { Router } from 'express';
import { sendPrices, sendSellers, sendModelsTest } from '../controllers/pricesControllers';
import { errMethodNotAllowed } from "../errorHandling/errorHandling";

const pricesRouter: Router = express.Router();

pricesRouter.route('/')
    .post(sendPrices)
    .get(sendSellers)
    .all(errMethodNotAllowed);

pricesRouter.route('/test-all-models')
    .get(sendModelsTest)
    .all(errMethodNotAllowed);


export default pricesRouter;
