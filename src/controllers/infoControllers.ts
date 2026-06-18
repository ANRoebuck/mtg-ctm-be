import { NextFunction, Request, Response } from 'express';
import { getFaq } from '../models/infoModels';

export const sendFaq = (req: Request, res: Response, next: NextFunction) => {
    const faq = getFaq();
    res.status(200).send({ faq });
}
