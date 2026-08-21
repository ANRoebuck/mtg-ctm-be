import { NextFunction, Request, Response } from 'express';
import { recordClickThrough, getClickThroughsBySeller, getClickThroughsByCard, getClickThroughsCardsBySeller, pruneClickThroughs } from '../models/clickThroughModels';

export const postClickThrough = (req: Request, res: Response, next: NextFunction) => {
    const { card = '', seller = '' } = { ...req.body };
    recordClickThrough(card, seller)
        .then(() => res.status(201).send({ message: 'Click-through recorded' }))
        .catch(next);
};

export const sendClickThroughsBySeller = (req: Request, res: Response, next: NextFunction) => {
    const days = req.query.days !== undefined ? Number(req.query.days) : undefined;
    getClickThroughsBySeller(days)
        .then(clickThroughs => res.status(200).send({ clickThroughs }))
        .catch(next);
};

export const sendClickThroughsByCard = (req: Request, res: Response, next: NextFunction) => {
    const days = req.query.days !== undefined ? Number(req.query.days) : undefined;
    getClickThroughsByCard(days)
        .then(clickThroughs => res.status(200).send({ clickThroughs }))
        .catch(next);
};

export const sendClickThroughsCardsBySeller = (req: Request, res: Response, next: NextFunction) => {
    const days = req.query.days !== undefined ? Number(req.query.days) : undefined;
    getClickThroughsCardsBySeller(days)
        .then(clickThroughs => res.status(200).send({ clickThroughs }))
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
