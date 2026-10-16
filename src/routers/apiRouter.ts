import express, { Router } from 'express';
import pricesRouter from './pricesRouter';
import dataRouter from './dataRouter';
import infoRouter from './infoRouter';
// import adminImportRouter from './adminImportRouter'; // DISABLED: see note below
import { errHandleMethodNotAllowed } from '../errorHandling/errorHandling';


const apiRouter: Router = express.Router();

apiRouter.route('/')
    // .get((req, res, next) => res.send(endPoints))
    .all(errHandleMethodNotAllowed)

apiRouter.use('/prices', pricesRouter);
apiRouter.use('/data', dataRouter);
apiRouter.use('/info', infoRouter);
// DISABLED: the one-off historical data replay (scripts/replayHistoricalData.js) has been run, so
// the unauthenticated /api/admin/import/* routes are no longer mounted. Left commented out rather
// than deleted for now; delete this, adminImportRouter.ts and the import methods in DataService.ts
// once we're sure they're not needed again.
// apiRouter.use('/admin/import', adminImportRouter);

export default apiRouter;
