import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app: Application = express();

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('Hello world');
});

app.listen(process.env.PORT || 5000, () => console.log('Server running'));
