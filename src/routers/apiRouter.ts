import express, { Router } from 'express';
import pricesRouter from './pricesRouter';
import dataRouter from './dataRouter';
import infoRouter from './infoRouter';
import { errHandleMethodNotAllowed } from '../errorHandling/errorHandling';


const apiRouter: Router = express.Router();

apiRouter.route('/')
    // .get((req, res, next) => res.send(endPoints))
    .all(errHandleMethodNotAllowed)

apiRouter.use('/prices', pricesRouter);
apiRouter.use('/data', dataRouter);
apiRouter.use('/info', infoRouter);

export default apiRouter;
