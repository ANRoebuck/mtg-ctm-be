import express, { Router } from 'express';
import { postSearchHistory, sendSearchHistory, deleteSearchHistory } from '../controllers/searchHistoryControllers';
import { errHandleMethodNotAllowed } from '../errorHandling/errorHandling';

const searchHistoryRouter: Router = express.Router();

searchHistoryRouter.route('/')
    .post(postSearchHistory)
    .get(sendSearchHistory)
    .delete(deleteSearchHistory)
    .all(errHandleMethodNotAllowed);

export default searchHistoryRouter;
