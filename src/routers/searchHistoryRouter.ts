import express, { Router } from 'express';
import { postSearchHistory, sendSearchHistory, deleteSearchHistory } from '../controllers/searchHistoryControllers';
import { errMethodNotAllowed } from '../errorHandling/errorHandling';

const searchHistoryRouter: Router = express.Router();

searchHistoryRouter.route('/')
    .post(postSearchHistory)
    .get(sendSearchHistory)
    .delete(deleteSearchHistory)
    .all(errMethodNotAllowed);

export default searchHistoryRouter;
