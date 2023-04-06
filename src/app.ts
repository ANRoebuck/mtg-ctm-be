import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routers/apiRouter';
import {errHandleCustom, errHandleInvalidEnpoint} from "./errorHandling/errorHandling";

const app: Application = express();

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('Hello world');
});

app.use('/api', apiRouter);

app.use('/*', errHandleInvalidEnpoint);
app.use(errHandleCustom);

app.listen(process.env.PORT || 5001, () => console.log('Server running'));
