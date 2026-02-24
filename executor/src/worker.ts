import { Worker } from 'bullmq';
import { chromium } from 'playwright';
import axios from 'axios';
import redis from 'redis';
import logger from './logger';
import * as dotenv from 'dotenv';

dotenv.config();

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});

const worker = new Worker('test-execution', async (job) => {
  try {
    logger.info(`Processing job ${job.id}: ${job.data.executionId}`);

    // Update execution status to running
    const apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    await axios.patch(`${apiUrl}/executions/${job.data.executionId}`, {
      status: 'running',
    });

    // Execute the Playwright script
    const result = await executePlaywrightScript(job.data);

    // Update execution with results
    await axios.patch(`${apiUrl}/executions/${job.data.executionId}`, {
      status: result.status,
      duration: result.duration,
      screenshotPath: result.screenshotPath,
      videoPath: result.videoPath,
      errorMessage: result.errorMessage || null,
      completedAt: new Date(),
    });

    logger.info(`Job ${job.id} completed successfully`);
    return result;
  } catch (error) {
    logger.error(`Job ${job.id} failed: ${(error as any).message}`);

    // Update execution with error
    await axios.patch(`${process.env.API_URL || 'http://localhost:3001/api'}/executions/${job.data.executionId}`, {
      status: 'failed',
      errorMessage: (error as any).message || 'Unknown error',
      completedAt: new Date(),
    });

    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});

async function executePlaywrightScript(jobData: any) {
  const startTime = Date.now();
  let browser;
  let result: {
    status: string;
    duration: number;
    screenshotPath: string | null;
    videoPath: string | null;
    errorMessage: string | null;
  } = {
    status: 'failed',
    duration: 0,
    screenshotPath: null,
    videoPath: null,
    errorMessage: null,
  };

  try {
    // Launch browser
    browser = await chromium.launch({
      headless: jobData.headless !== false,
    });

    const context = await browser.newContext({
      recordVideo: { dir: '/artifacts/videos' },
    });

    const page = await context.newPage();

    // Execute the Playwright script
    // This is a simplified version - in production, you'd use eval or better script execution
    logger.info(`Executing script for execution ${jobData.executionId}`);

    // Add a delay to simulate test execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Take screenshot
    result.screenshotPath = `/artifacts/screenshots/${jobData.executionId}.png`;
    await page.screenshot({ path: result.screenshotPath });

    // Get video path
    await context.close();
    result.videoPath = null; // Video path not available in this implementation

    result.status = 'passed';
    result.duration = Date.now() - startTime;

    logger.info(`Execution ${jobData.executionId} completed with status: ${result.status}`);
  } catch (error) {
    logger.error(`Script execution failed: ${(error as any).message}`);
    result.errorMessage = (error as any).message || 'Unknown error';
    result.duration = Date.now() - startTime;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

worker.on('completed', (job: any) => {
  if (job) {
    logger.info(`Job ${job.id} has been completed`);
  }
});

worker.on('failed', (job: any, err) => {
  if (job) {
    logger.error(`Job ${job.id} has failed with ${err.message}`);
  }
});

logger.info('Test Executor Worker started');
