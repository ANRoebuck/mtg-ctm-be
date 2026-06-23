import { NextFunction, Request, Response } from 'express';
import { ts } from '../utils/Logger';


// invalid endpoint || missing resource
export const errHandleInvalidEnpoint = (req: Request, res: Response, next: NextFunction) => {
    const errObj = {
        status: 404,
        message: `not found: ${req.method} ${req.originalUrl}`
    };
    next(errObj);
};

// method not allowed
export const errHandleMethodNotAllowed = (req: Request, res: Response, next: NextFunction) => {
    const errObj = {
        status: 405,
        message: `method not allowed: ${req.method} ${req.originalUrl}`
    };
    next(errObj);
};

// custom error
export const errHandleCustomError = (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    const { status = 500, message } = err;
    console.error(`[${ts()}] [errHandleCustomError] [${status}] ${message}`);
    res.status(status).send({ message });
};

class HttpException extends Error {
    public status: number
    public message: string
    constructor(status: number, message: string) {
        super(message)
        this.status = status
        this.message = message
    }
}
