// DISABLED: the one-off replay has been run, so this router is no longer mounted in apiRouter.ts
// and its code is commented out below (kept for now rather than deleted). These routes were
// deliberately unauthenticated, so do not re-enable them without adding auth. To remove them
// for good, delete this file, the commented-out mount in apiRouter.ts, the import methods and
// guards in DataService.ts (and their tests) and the raised JSON limit in app.ts.
//
// import express, { Router, Request, Response, NextFunction } from 'express';
// import dataService from '../services/dataService/DataService';
// import { errHandleMethodNotAllowed } from '../errorHandling/errorHandling';
//
// const adminImportRouter: Router = express.Router();
//
// adminImportRouter.route('/search-history')
//     .post((req: Request, res: Response, next: NextFunction) => {
//         dataService.importSearchHistory(req.body?.entries)
//             .then(result => res.status(201).send(result))
//             .catch(next);
//     })
//     .all(errHandleMethodNotAllowed);
//
// adminImportRouter.route('/click-through')
//     .post((req: Request, res: Response, next: NextFunction) => {
//         dataService.importClickThroughs(req.body?.entries)
//             .then(result => res.status(201).send(result))
//             .catch(next);
//     })
//     .all(errHandleMethodNotAllowed);
//
// export default adminImportRouter;
