import express, { Router } from 'express';
import pricesRouter from './pricesRouter';
import searchHistoryRouter from './searchHistoryRouter';
import clickThroughRouter from './clickThroughRouter';
import { errMethodNotAllowed } from '../errorHandling/errorHandling';


const apiRouter: Router = express.Router();

apiRouter.route('/')
    // .get((req, res, next) => res.send(endPoints))
    .all(errMethodNotAllowed)

apiRouter.use('/prices', pricesRouter);
apiRouter.use('/search-history', searchHistoryRouter);
apiRouter.use('/click-through', clickThroughRouter);

export default apiRouter;
