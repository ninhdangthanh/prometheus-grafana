import express, { Request, Response } from 'express';
import cors from 'cors';
import { AddressInfo } from 'net';
import client from 'prom-client';
import { setTimeout } from 'timers/promises';

(async function run() {
  const app = express();
  // Create a Registry to register the metrics
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  const httpRequestTimer = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    // buckets for response time from 0.1ms to 500ms
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
  });

  register.registerMetric(httpRequestTimer);

  app.use(cors());
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: false,
    })
  );

  app.get('/tweets', async (req: Request, res: Response) => {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;
    res.json({ message: 'hello world !' });
    end({ route, code: res.statusCode, method: req.method });
  });

  app.get('/slow', async (req: Request, res: Response) => {
    const end = httpRequestTimer.startTimer();
    await setTimeout(Math.floor(Math.random() * 500));
    const route = req.route.path;
    res.json({ message: 'hello slow !' });
    end({ route, code: res.statusCode, method: req.method });
  });

  app.get('/metrics', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  });

  const server = app.listen(8080, () => {
    const { port } = server.address() as AddressInfo;
    console.log(`[twitter-clone] 🚀 server started and available on http://localhost:${port}`);
  });
})();
