import {NextFunction, Request, Response} from 'express';
import { getPrices, getSellers } from '../models/pricesModels';


export const sendPrices = (req: Request, res: Response, next: NextFunction) => {
    const { seller = '', searchTerm = '', saveOutput = false } = { ...req.body };
    getPrices(seller, searchTerm, saveOutput)
        .then(prices => res.status(200).send({ prices }))
        .catch(next);
}

export const sendSellers = (req: Request, res: Response, next: NextFunction) => {
    const sellers = getSellers();
    res.status(200).send({ sellers });
}
