import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routers/apiRouter';
import { errHandleCustom, errHandleInvalidEnpoint } from "./errorHandling/errorHandling";
import configureAxios from './gateway/configureAxios';

const app: Application = express();

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('Hello world');
});

app.use('/api', apiRouter);

app.use('/*', errHandleInvalidEnpoint);
app.use(errHandleCustom);

const port = process.env.PORT || 5001;

app.listen(port, () => console.log('Server running on port ' + port));

configureAxios();
