import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Server } from 'http';
import config from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const PORT = config.port;

if (config.isDevelopment) {
  app.use(cors({ origin: '*' }));
  app.use(morgan('dev'));
} else {
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(morgan('combined'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).send({
    success: true,
    message:
      "Server is healthy and ready. No sleeping on bicycle. Let's get the API started.",
    environment: config.env,
  });
});

// Middleware to catch all undefinedroutes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `${req.originalUrl} does not exist`,
    timestamp: new Date(),
  });
});
app.use(errorHandler);

let server: Server;

const shutdownServer = async () => {
  if (server) {
    try {
      server.close(async () => {
        await disconnectDB();
        console.log('Server shut down successful.');
        process.exit(0);
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      error instanceof Error
        ? console.error('Failed to shut down server:', error.message)
        : console.error('Failed to shut down server', error);
      process.exit(1);
    }
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdownServer);
process.on('SIGINT', shutdownServer);

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    error instanceof Error
      ? console.error('Failed to start server', error.message)
      : console.error('Failed to start server', error);
    await shutdownServer();
  }
};

startServer();
