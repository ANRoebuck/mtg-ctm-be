import { NextFunction, Request, Response } from 'express';
import { recordSearchHistory, getSearchHistory, pruneSearchHistory } from '../models/searchHistoryModels';

export const postSearchHistory = (req: Request, res: Response, next: NextFunction) => {
    const { searchedFor = [] } = { ...req.body };
    recordSearchHistory(searchedFor)
        .then(() => res.status(201).send({ message: 'Search history recorded' }))
        .catch(next);
};

export const sendSearchHistory = (req: Request, res: Response, next: NextFunction) => {
    const days = req.query.days !== undefined ? Number(req.query.days) : undefined;
    getSearchHistory(days)
        .then(searchHistory => res.status(200).send({ searchHistory }))
        .catch(next);
};

export const deleteSearchHistory = (req: Request, res: Response, next: NextFunction) => {
    const olderThanDays = Number(req.query.olderThan);
    if (isNaN(olderThanDays) || olderThanDays <= 0) {
        return next({ status: 400, message: 'olderThan must be a positive number of days' });
    }
    pruneSearchHistory(olderThanDays)
        .then(result => res.status(200).send(result))
        .catch(next);
};
