import {NextFunction, Request, Response} from 'express';
import getPrices from '../models/pricesModels';


const sendPrices = (req: Request, res: Response, next: NextFunction) => {
    const { seller = '', searchTerm = '' } = { ... req.params, ...req.query, ...req.body };
    console.log(seller, searchTerm);
    getPrices({ seller, searchTerm })
        .then(prices => res.status(200).send({ prices }))
        .catch(next);
}

export default sendPrices;
