import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// Azure OpenAI client configuration
const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
const azureOpenAIKey = process.env.OPENAI_API_KEY || '';
const deploymentId = process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4o';
const apiVersion = '2024-08-01-preview';

async function callAzureOpenAI(messages: any[]): Promise<string> {
  if (!azureOpenAIKey || !azureOpenAIEndpoint) {
    console.warn('Azure OpenAI credentials not configured, using stub responses');
    return '';
  }

  try {
    const response = await axios.post(
      `${azureOpenAIEndpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`,
      { messages, temperature: 0.7, max_tokens: 2000 },
      { headers: { 'api-key': azureOpenAIKey } },
    );
    return response.data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    return '';
  }
}

export class PlannerAgent {
  async generateTestScenarios(
    navigationFlow: string,
    acceptanceCriteria: string,
    prompt?: string,
  ): Promise<any[]> {
    // Stub response - will be replaced with actual Azure OpenAI call
    return [
      {
        name: 'Login Test Scenario',
        description: 'Test user login functionality',
        steps: ['Navigate to app', 'Enter credentials', 'Click login'],
      },
      {
        name: 'Navigation Test',
        description: 'Test navigation flow',
        steps: ['Navigate to home', 'Verify page loaded', 'Navigate to sections'],
      },
    ];
  }
}

export class GeneratorAgent {
  async generatePlaywrightScript(
    scenarioName: string,
    steps: string[],
    appUrl?: string,
  ): Promise<string> {
    // Stub response - will be replaced with actual Azure OpenAI call
    return `
import { test, expect } from '@playwright/test';

test('${scenarioName}', async ({ page }) => {
  // Navigate to application
  await page.goto(process.env.APP_URL || '${appUrl || 'https://www.saucedemo.com'}');
  
  // Perform test actions
  ${steps.map((step, i) => `// Step ${i + 1}: ${step}`).join('\n  ')}
  
  // Verify results
  await expect(page).toHaveTitle(/.*Test.*/);
});
    `;
  }
}

export class HealerAgent {
  async fixFailingTest(
    scenarioName: string,
    failedScript: string,
    errorMessage: string,
  ): Promise<string> {
    // Stub response - will be replaced with actual Azure OpenAI call
    return `
import { test, expect } from '@playwright/test';

test('${scenarioName} - Fixed', async ({ page }) => {
  // Fixed version with better error handling and waits
  await page.goto(process.env.APP_URL || 'https://www.saucedemo.com', { timeout: 30000 });
  
  // Wait for elements to be visible before interaction
  await page.waitForLoadState('networkidle');
  
  // Add proper assertions
  await expect(page).toHaveTitle(/.*Test.*/);
});
    `;
  }
}
