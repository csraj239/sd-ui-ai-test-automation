import logger from './logger';
import { Worker as BullWorker } from 'bullmq';
import * as dotenv from 'dotenv';

dotenv.config();

// Start the worker (will be imported and started from dist/worker.js)
logger.info('Starting Test Executor Service...');
logger.info(`Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
logger.info(`API URL: ${process.env.API_URL}`);

export {};
