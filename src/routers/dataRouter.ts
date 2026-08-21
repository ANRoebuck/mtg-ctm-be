import express, { Router } from 'express';
import searchHistoryRouter from './searchHistoryRouter';
import clickThroughRouter from './clickThroughRouter';

const dataRouter: Router = express.Router();

dataRouter.use('/search-history', searchHistoryRouter);
dataRouter.use('/click-through', clickThroughRouter);

export default dataRouter;
