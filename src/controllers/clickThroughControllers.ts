import { NextFunction, Request, Response } from 'express';
import { recordClickThrough, getClickThroughsBySeller, getClickThroughsByCard, getClickThroughsCardsBySeller, getRecentClickThroughs, pruneClickThroughs, getClickThroughsByDate } from '../models/clickThroughModels';

export const postClickThrough = (req: Request, res: Response, next: NextFunction) => {
    const { card = '', seller = '' } = { ...req.body };
    recordClickThrough(card, seller)
        .then(() => res.status(201).send({ message: 'Click-through recorded' }))
        .catch(next);
};

export const sendClickThroughsBySeller = (req: Request, res: Response, next: NextFunction) => {
    const days = req.query.days !== undefined ? Number(req.query.days) : undefined;
    if (days !== undefined && (isNaN(days) || days <= 0)) {
        return next({ status: 400, message: 'days must be a positive number' });
    }
    getClickThroughsBySeller(days)
        .then(clickThroughs => res.status(200).send({ clickThroughs }))
        .catch(next);
};

export const sendClickThroughsByCard = (req: Request, res: Response, next: NextFunction) => {
    const days = req.query.days !== undefined ? Number(req.query.days) : undefined;
    if (days !== undefined && (isNaN(days) || days <= 0)) {
        return next({ status: 400, message: 'days must be a positive number' });
    }
    getClickThroughsByCard(days)
        .then(clickThroughs => res.status(200).send({ clickThroughs }))
        .catch(next);
};

export const sendClickThroughsCardsBySeller = (req: Request, res: Response, next: NextFunction) => {
    const days = req.query.days !== undefined ? Number(req.query.days) : undefined;
    if (days !== undefined && (isNaN(days) || days <= 0)) {
        return next({ status: 400, message: 'days must be a positive number' });
    }
    getClickThroughsCardsBySeller(days)
        .then(clickThroughs => res.status(200).send({ clickThroughs }))
        .catch(next);
};

export const sendRecentClickThroughs = (req: Request, res: Response, next: NextFunction) => {
    const count = req.query.count !== undefined ? Number(req.query.count) : undefined;
    getRecentClickThroughs(count)
        .then(recentClickThroughs => res.status(200).send({ recentClickThroughs }))
        .catch(next);
};

export const sendClickThroughsByDate = (req: Request, res: Response, next: NextFunction) => {
    const days = req.query.days !== undefined ? Number(req.query.days) : undefined;
    getClickThroughsByDate(days)
        .then(clickThroughsByDate => res.status(200).send({ clickThroughsByDate }))
        .catch(next);
};

export const deleteClickThroughs = (req: Request, res: Response, next: NextFunction) => {
    const olderThanDays = Number(req.query.olderThan);
    if (isNaN(olderThanDays) || olderThanDays <= 0) {
        return next({ status: 400, message: 'olderThan must be a positive number of days' });
    }
    pruneClickThroughs(olderThanDays)
        .then(result => res.status(200).send(result))
        .catch(next);
};
