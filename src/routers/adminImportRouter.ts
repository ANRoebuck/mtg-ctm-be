// TEMPORARY: one-off endpoints for scripts/replayHistoricalData.js. Deliberately unauthenticated;
// each can succeed only once per process. Delete this file (and its mount in apiRouter.ts,
// the import methods in DataService.ts and the raised JSON limit in app.ts) after the replay.
import express, { Router, Request, Response, NextFunction } from 'express';
import dataService from '../services/dataService/DataService';
import { errHandleMethodNotAllowed } from '../errorHandling/errorHandling';

const adminImportRouter: Router = express.Router();

adminImportRouter.route('/search-history')
    .post((req: Request, res: Response, next: NextFunction) => {
        dataService.importSearchHistory(req.body?.entries)
            .then(result => res.status(201).send(result))
            .catch(next);
    })
    .all(errHandleMethodNotAllowed);

adminImportRouter.route('/click-through')
    .post((req: Request, res: Response, next: NextFunction) => {
        dataService.importClickThroughs(req.body?.entries)
            .then(result => res.status(201).send(result))
            .catch(next);
    })
    .all(errHandleMethodNotAllowed);

export default adminImportRouter;
