import express, { Request, Response } from 'express';
import competitions from 'controllers/competitions';
import plus from 'controllers/plus';
import results from 'controllers/results';

const app = express();
const port = 3000;

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routers
app.use('/competitions', competitions);
app.use('/plus', plus);
app.use('/results', results);

// Root route
app.get('/', (_req, res) => {
  res.send('alive');
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: err });
});

// Start server
export const startExpressServer = () => {
  app.listen(port, () => {
    console.log(`Express server is listening on port ${port}`);
  });
};
