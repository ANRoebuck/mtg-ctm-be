import { NextFunction, Request, Response } from 'express';


// invalid endpoint || missing resource
export const errHandleInvalidEnpoint = (req: Request, res: Response, next: NextFunction) => {
    const errObj = {
        status: 404,
        message: "not found"
    };
    next(errObj);
};

// method not allowed
export const errMethodNotAllowed = (req: Request, res: Response, next: NextFunction) => {
    const errObj = {
        status: 405,
        message: "method not allowed"
    };
    next(errObj);
};

// custom error
export const errHandleCustom = (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res.status(err.status).send({ message: err.message });
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
