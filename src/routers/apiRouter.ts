import express, { Application, Router, Request, Response, NextFunction } from 'express';
import pricesRouter from './pricesRouter';


const apiRouter: Router = express.Router();

apiRouter.use('/prices', pricesRouter);


export default apiRouter;
