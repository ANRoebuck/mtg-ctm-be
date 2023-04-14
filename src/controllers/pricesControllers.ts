import {NextFunction, Request, Response} from 'express';
import getPrices from '../models/pricesModels';


const sendPrices = (req: Request, res: Response, next: NextFunction) => {
    const { seller = '', searchTerm = '', saveOutput = false } = { ...req.body };
    getPrices(seller, searchTerm, saveOutput)
        .then(prices => res.status(200).send({ prices }))
        .catch(next);
}

export default sendPrices;
