import express, { Application, Router, Request, Response, NextFunction } from 'express';
import { sendPrices, sendSellers } from '../controllers/pricesControllers';
import {errMethodNotAllowed} from "../errorHandling/errorHandling";

const pricesRouter: Router = express.Router();

pricesRouter.route('/')
    .post(sendPrices)
    .get(sendSellers)
    .all(errMethodNotAllowed);


export default pricesRouter;
