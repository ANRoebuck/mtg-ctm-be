import express, { Router } from 'express';
import pricesRouter from './pricesRouter';
import dataRouter from './dataRouter';
import infoRouter from './infoRouter';
import adminImportRouter from './adminImportRouter';
import { errHandleMethodNotAllowed } from '../errorHandling/errorHandling';


const apiRouter: Router = express.Router();

apiRouter.route('/')
    // .get((req, res, next) => res.send(endPoints))
    .all(errHandleMethodNotAllowed)

apiRouter.use('/prices', pricesRouter);
apiRouter.use('/data', dataRouter);
apiRouter.use('/info', infoRouter);
apiRouter.use('/admin/import', adminImportRouter); // TEMPORARY: remove after the one-off historical data replay

export default apiRouter;
