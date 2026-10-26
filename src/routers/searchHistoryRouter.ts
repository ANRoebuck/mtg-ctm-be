import express, { Router } from 'express';
import { postSearchHistory, sendSearchHistory, sendRecentSearches, deleteSearchHistory, sendSearchesByDate } from '../controllers/searchHistoryControllers';
import { errHandleMethodNotAllowed } from '../errorHandling/errorHandling';

const searchHistoryRouter: Router = express.Router();

searchHistoryRouter.route('/')
    .post(postSearchHistory)
    .get(sendSearchHistory)
    .delete(deleteSearchHistory)
    .all(errHandleMethodNotAllowed);

searchHistoryRouter.route('/recent')
    .get(sendRecentSearches)
    .all(errHandleMethodNotAllowed);

searchHistoryRouter.route('/by-date')
    .get(sendSearchesByDate)
    .all(errHandleMethodNotAllowed);

export default searchHistoryRouter;
