import { setTimeout } from 'timers/promises';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { AddressInfo } from 'net';
import promClient from 'prom-client';
import { Client } from 'pg';
import { TweetService } from './tweet';

/**
 * Randomly throw error and slow response
 */
async function chaos(res: Response): Promise<void> {
  const codes = [400, 401, 403, 404, 409, 500];
  const rand = Math.floor(Math.random() * 500);

  if (rand < 450) {
    const pause = Math.floor(Math.random() * 500);
    return setTimeout(pause);
  }
  res.statusCode = codes[Math.floor(Math.random() * codes.length)];
  throw new Error('BOOM !');
}

(async function run() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: false,
    })
  );

  const pgClient = new Client({
    user: 'monitoring',
    host: 'localhost',
    database: 'monitoring-article',
    password: 'secret',
    port: 5432,
  });
  pgClient.connect();

  // Create a Registry to register the metrics
  const register = new promClient.Registry();
  register.setDefaultLabels({
    app: 'monitoring-article',
  });
  promClient.collectDefaultMetrics({ register });

  const httpRequestTimer = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    // buckets for response time from 0.1ms to 1s
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000],
  });

  register.registerMetric(httpRequestTimer);

  const tweetService = new TweetService(pgClient);

  await tweetService.createTable();

  app.get('/tweets', async (req: Request, res: Response) => {
    const start = Date.now();
    try {
      await chaos(res);

      const tweets = await tweetService.listTweets();
      res.json(tweets);
    } catch (err: any) {
      res.send(err.message);
    } finally {
      const responseTimeInMs = Date.now() - start;
      httpRequestTimer.labels(req.method, req.route.path, res.statusCode.toString()).observe(responseTimeInMs);
    }
  });

  app.post('/tweets', async (req, res) => {
    const start = Date.now();
    try {
      const { message } = req.body;

      await chaos(res);

      const created = await tweetService.createTweet(message);
      res.status(201).json(created);
    } catch (err: any) {
      res.send(err.message);
    } finally {
      const responseTimeInMs = Date.now() - start;
      httpRequestTimer.labels(req.method, req.route.path, res.statusCode.toString()).observe(responseTimeInMs);
    }
  });

  app.get('/metrics', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  });

  const server = app.listen(8080, () => {
    const { port } = server.address() as AddressInfo;
    console.log(`🚀 server started and available on http://localhost:${port}`);
  });
})();
