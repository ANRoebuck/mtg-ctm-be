import express, { Application, Router, Request, Response, NextFunction } from 'express';
import sendPrices from '../controllers/pricesControllers';
import {errMethodNotAllowed} from "../errorHandling/errorHandling";

const pricesRouter: Router = express.Router();

pricesRouter.route('/')
    .get(sendPrices)
    .all(errMethodNotAllowed)


export default pricesRouter;
