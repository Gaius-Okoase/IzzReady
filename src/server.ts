import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Server } from 'http';
import config from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import authRoute from './routes/authRoute.js'
import { authLimit } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';


const app = express();

const PORT = config.port;

/* Middlewares */
// Security
if (config.isProduction) {
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(morgan('combined'));
} else {
  app.use(cors({ origin: '*' }));
  app.use(morgan('dev'));
}

// Request parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).send({
    success: true,
    message:
      "Server is healthy and ready. No sleeping on bicycle. Let's get the API started.",
    uptime: process.uptime(),
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// Routes with rate limiter
app.use('/auth', authLimit, authRoute);

// Catch all undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

let server: Server;

/* Server Process */
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
