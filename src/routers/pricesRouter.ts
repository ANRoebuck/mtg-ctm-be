import express, { Application, Router, Request, Response, NextFunction } from 'express';

const pricesRouter: Router = express.Router();

pricesRouter.route('/:seller')
    .get()

export default pricesRouter;
