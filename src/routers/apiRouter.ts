import express, { Router } from 'express';
import pricesRouter from './pricesRouter';
import { errMethodNotAllowed } from '../errorHandling/errorHandling';


const apiRouter: Router = express.Router();

apiRouter.route('/')
    // .get((req, res, next) => res.send(endPoints))
    .all(errMethodNotAllowed)

apiRouter.use('/prices', pricesRouter);

export default apiRouter;
