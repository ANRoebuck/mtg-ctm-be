import express, { Application, Router, Request, Response, NextFunction } from 'express';
import sendPrices from '../controllers/pricesControllers';

const pricesRouter: Router = express.Router();

pricesRouter.route('/:seller')
    .get(sendPrices)

export default pricesRouter;
