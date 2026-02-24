import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

@Injectable()
export class PlaywrightGeneratorService {
  /**
   * Generate Playwright script with realistic locators using AI
   * Pure TypeScript implementation - no external dependencies
   */
  async generateScriptWithLocators(params: {
    navigationFlow: string;
    acceptanceCriteria: string;
    appUrl: string;
    steps?: string[];
  }): Promise<string> {
    try {
      // Use AI-based script generation with Playwright best practices
      return await this.generateScriptWithAI(params);
    } catch (error: any) {
      console.error('Error generating script:', error?.message);
      // Fallback to mock if AI fails
      return this.generateMockPlaywrightScript(params);
    }
  }

  /**
   * Generate script using Azure OpenAI with Playwright expertise
   */
  private async generateScriptWithAI(params: {
    navigationFlow: string;
    acceptanceCriteria: string;
    appUrl: string;
    steps?: string[];
  }): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiVersion = process.env.OPENAI_API_VERSION || '2023-03-15-preview';
    const deploymentName = process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4o';

    if (!apiKey || !endpoint) {
      return this.generateMockPlaywrightScript(params);
    }

    try {
      const prompt = this.buildPlaywrightPrompt(params);
      const response = await axios.post(
        `${endpoint}openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
        {
          messages: [
            {
              role: 'system',
              content: `You are an expert Playwright automation engineer with deep knowledge of test automation best practices.
              Generate production-ready Playwright scripts in TypeScript.
              
              CRITICAL RULES:
              1. Use modern Playwright locators: page.locator() with optimal selectors
              2. Include proper waits: page.waitForSelector(), page.waitForLoadState()
              3. Use role-based selectors when possible: page.locator('button:has-text("Text")')
              4. Include error handling with try-catch blocks
              5. Add console.log() statements for debugging
              6. Use assertions to validate expectations
              7. Structure code as a complete executable TypeScript file
              8. Include browser context configuration
              9. Add proper cleanup in finally blocks
              10. Use page.screenshot() for debugging on failure`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        },
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      // Extract code block if wrapped in markdown
      const codeMatch = content.match(/```(?:typescript|ts)?\n([\s\S]*?)\n```/);
      const script = codeMatch ? codeMatch[1] : content;
      
      // Validate the script has expected Playwright imports
      if (!script.includes('chromium') && !script.includes('firefox') && !script.includes('webkit')) {
        throw new Error('Invalid script: missing browser import');
      }
      
      return script;
    } catch (error: any) {
      console.error('Error with OpenAI API:', error?.message);
      return this.generateMockPlaywrightScript(params);
    }
  }

  /**
   * Build Playwright-focused prompt for AI
   * Generates script for ONLY the provided steps - no additional tests
   */
  private buildPlaywrightPrompt(params: {
    navigationFlow: string;
    acceptanceCriteria: string;
    appUrl: string;
    steps?: string[];
  }): string {
    const stepsText = params.steps && params.steps.length > 0 
      ? params.steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')
      : 'No specific steps provided';

    return `Generate a MINIMAL Playwright test script that executes ONLY the following steps.

**CRITICAL: DO NOT ADD ANY EXTRA STEPS OR TESTS BEYOND THOSE LISTED BELOW**

**Application URL:** ${params.appUrl}

**EXACT Steps to Execute (No More, No Less):**
${stepsText}

**Execution Style:**
- Launch browser in HEADED mode (headless: false) for visual observation
- Follow the steps in exact order
- Use modern Playwright locators: page.locator() with CSS selectors or role-based selectors
- Add console.log() for each step execution
- Include basic error handling (try-catch with screenshot on failure)
- Do NOT add verification steps, assertions, or extra tests
- Do NOT add acceptance criteria validation or extra checks
- Execute the ${params.steps?.length || 0} steps provided and stop

**Output Format - Return ONLY TypeScript code in triple backticks:**
\`\`\`typescript
import { chromium, Browser, Page, BrowserContext } from '@playwright/test';

// Execute only the provided steps
async function runTest() {
  // Implementation here
}

runTest().catch(console.error);
\`\`\``;
  }

  /**
   * Generate professional mock Playwright script when AI unavailable
   * This serves as both fallback AND template for users
   */
  /**
   * Generate MINIMAL mock Playwright script
   * Includes ONLY the provided steps - no extra tests or verification
   */
  private generateMockPlaywrightScript(params: {
    navigationFlow: string;
    acceptanceCriteria: string;
    appUrl: string;
    steps?: string[];
  }): string {
    const appUrl = params.appUrl || 'https://localhost:3000';
    const stepsList = params.steps || [];
    
    const stepsCode = stepsList
      .map(
        (step, idx) => `
    // Step ${idx + 1}: ${step}
    console.log('📍 Step ${idx + 1}: ${step}');
    try {
      // TODO: Replace with actual Playwright actions
      // Example actions:
      // await page.locator('button:has-text("${step.substring(0, 20)}")').click();
      // await page.locator('input').first().fill('value');
      // await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    } catch (stepError) {
      console.error('❌ Step ${idx + 1} failed:', stepError);
      throw stepError;
    }
`
      )
      .join('');

    return `import { chromium, Browser, Page, BrowserContext } from '@playwright/test';

/**
 * Playwright Test Script
 * Executes ONLY the ${stepsList.length} provided step(s) - no additional tests
 */

async function runTest() {
  const browser: Browser = await chromium.launch({
    headless: false, // Headed mode for visual observation
  });

  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page: Page = await context.newPage();

  try {
    console.log('🚀 Starting Test Execution');
    console.log('📱 Browser: Chromium (Headed Mode)');
    console.log(\`📍 Total Steps: \${${stepsList.length}}\`);
    console.log('═════════════════════════════════\\n');

    // Navigate to application
    console.log('🔗 Navigating to: ${appUrl}');
    await page.goto('${appUrl}', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('✅ Application loaded\\n');

    // Execute only the provided steps
${stepsCode}

    console.log('\\n═════════════════════════════════');
    console.log('✅ All ${stepsList.length} step(s) completed successfully!');
    console.log('═════════════════════════════════\\n');

  } catch (error: any) {
    console.error('\\n❌ FAILED');
    console.error('Error:', error?.message || error);

    // Capture screenshot on failure
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = \`failure-\${timestamp}.png\`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error(\`📸 Screenshot: \${screenshotPath}\`);
    } catch (screenshotError) {
      // Silent fail
    }

    throw error;

  } finally {
    // Cleanup
    await context.close();
    await browser.close();
  }
}

// Execute
runTest()
  .then(() => {
    console.log('✓ Script execution complete');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
`;
  }

  /**
   * Execute Playwright script asynchronously and capture output
   * Creates a wrapper that properly handles ES module imports
   */
  async executeScript(script: string): Promise<{
    success: boolean;
    output: string;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const tmpDir = path.join(process.cwd(), '.tmp');
      const timestamp = Date.now();
      const wrapperFile = path.join(tmpDir, `wrapper-${timestamp}.mjs`);

      try {
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Convert TypeScript to JavaScript
        let jsScript = this.removeTypeAnnotationsOnly(script);

        // Remove all import/require statements from the script
        // The wrapper will provide the necessary imports
        jsScript = jsScript
          .replace(/^import\s+.*?from\s+['"][^'"]+['"];?$/gm, '')
          .replace(/^const\s+{\s*[^}]*\s*}\s*=\s*require\(['"][^'"]+['"]\);?$/gm, '')
          .replace(/^const\s+\w+\s*=\s*require\(['"][^'"]+['"]\);?$/gm, '');

        // Create ES module wrapper that imports and executes the script
        const wrapperCode = `import { chromium, firefox, webkit } from '@playwright/test';

// Execute the user's script
async function executeUserScript() {
${jsScript.split('\n').map(line => '  ' + line).join('\n')}
}

executeUserScript().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
`;

        // Write wrapper script as .mjs (ES module)
        fs.writeFileSync(wrapperFile, wrapperCode, 'utf-8');

        // Collect output
        let stdout = '';
        let stderr = '';
        let timedOut = false;

        // Execute with node
        const childProcess = spawn('node', [wrapperFile], {
          cwd: process.cwd(),
          timeout: 120000, // 2 minute timeout
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        // Capture stdout
        childProcess.stdout?.on('data', (data) => {
          const output = data.toString();
          stdout += output;
        });

        // Capture stderr
        childProcess.stderr?.on('data', (data) => {
          const output = data.toString();
          stderr += output;
        });

        // Handle timeout
        const executionTimeout = setTimeout(() => {
          timedOut = true;
          childProcess.kill();
        }, 120000);

        // Handle process exit
        childProcess.on('exit', (code) => {
          clearTimeout(executionTimeout);

          // Clean up temp file
          try {
            if (fs.existsSync(wrapperFile)) {
              fs.unlinkSync(wrapperFile);
            }
          } catch (e) {
            // Ignore cleanup errors
          }

          if (timedOut) {
            resolve({
              success: false,
              error: 'Script execution timed out after 2 minutes',
              output: `❌ Timeout Error: Script execution exceeded 2 minute limit\n\n${stdout}${stderr}`,
            });
            return;
          }

          if (code === 0 || (code === null && stdout)) {
            resolve({
              success: true,
              output: stdout || 'Script executed successfully',
              error: stderr || undefined,
            });
          } else {
            resolve({
              success: false,
              error: stderr || `Process exited with code ${code}`,
              output:
                `❌ Script Execution Failed\n\n${stdout || 'No output'}\n\n${
                  stderr ? 'Error: ' + stderr : ''
                }`.trim(),
            });
          }
        });

        // Handle process errors
        childProcess.on('error', (error: any) => {
          clearTimeout(executionTimeout);

          // Clean up temp file
          try {
            if (fs.existsSync(wrapperFile)) {
              fs.unlinkSync(wrapperFile);
            }
          } catch (e) {
            // Ignore cleanup errors
          }

          resolve({
            success: false,
            error: error?.message || 'Failed to spawn process',
            output: `❌ Process Error: ${error?.message || 'Failed to start execution'}\n\nMake sure @playwright/test is installed:\nnpm install --save-dev @playwright/test`,
          });
        });
      } catch (error: any) {
        resolve({
          success: false,
          error: error?.message || 'Failed to prepare script',
          output: `❌ Error: ${error?.message || 'Failed to prepare script execution'}`,
        });
      }
    });
  }

  /**
   * Remove only type annotations, keeping imports and code structure
   */
  private removeTypeAnnotationsOnly(tsScript: string): string {
    let jsScript = tsScript;

    // Process line by line
    const lines = jsScript.split('\n');
    const processedLines = lines.map((line: string) => {
      // Skip import statements and comments
      if (line.trim().startsWith('import ') || line.trim().startsWith('//') || 
          line.trim().startsWith('*')) {
        return line;
      }

      let result = line;

      // Remove variable type annotations: let x: Type = value
      result = result.replace(
        /^(\s*(?:let|const|var)\s+(\w+))\s*:\s*([\w|&[\]\s<>,.]+?)\s*(=|;)/,
        (match, prefix, varName, typeInfo, separator) => {
          if (/[|&[\]<>]|^[A-Z]/.test(typeInfo)) {
            return prefix + separator;
          }
          return match;
        }
      );

      // Remove function return types: ): Type {
      result = result.replace(/\)\s*:\s*([\w|&[\]\s<>,.]+?)\s*{/, (match, typeInfo) => {
        if (/[|&[\]<>]|^[A-Z]/.test(typeInfo)) {
          return ') {';
        }
        return match;
      });

      // Remove function parameter types: (param: Type)
      if (result.includes('(') && result.includes(')') && result.includes(':')) {
        result = result.replace(/\(([^{}]*?)\)/g, (match) => {
          return match.replace(
            /(\w+)\s*:\s*([\w|&[\]\s<>,.]+?)(?=[,)])/g,
            (param, name, typeInfo) => {
              if (/[|&[\]<>]|^[A-Z]/.test(typeInfo)) {
                return name;
              }
              return param;
            }
          );
        });
      }

      return result;
    });

    jsScript = processedLines.join('\n');

    // Remove type/interface/enum declarations
    jsScript = jsScript
      .replace(/^\s*type\s+\w+[\s\S]*?;/gm, '')
      .replace(/^\s*interface\s+\w+[\s\S]*?^}$/gm, '')
      .replace(/^\s*enum\s+\w+[\s\S]*?^}$/gm, '');

    // Remove generic type parameters
    jsScript = jsScript.replace(/<([\w|&[\]\s<>,.]+)>/, (match, content) => {
      if (/\w/.test(content) && !/^[<>=]/.test(content)) {
        return '';
      }
      return match;
    });

    return jsScript;
  }

  /**
   * Convert TypeScript to JavaScript by removing type annotations
   * Only targets obvious type annotation patterns, leaves object literals and operators alone
   */
  private convertTypeScriptToJavaScript(tsScript: string): string {
    // Convert imports to CommonJS
    let jsScript = tsScript
      .replace(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g, 
        "const { $1 } = require('$2');")
      .replace(/import\s+(\w+)\s*from\s*['"]([^'"]+)['"]/g, 
        "const $1 = require('$2');");

    // Process line by line for precise control
    const lines = jsScript.split('\n');
    const processedLines = lines.map((line: string) => {
      // Skip comments and empty lines
      if (!line.trim() || line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return line;
      }

      let result = line;

      // PATTERN 1: Remove variable type annotations ONLY
      // Match: let/const/var name: Type = value
      // Only match if type looks like a type (uppercase or | symbol), not a property
      result = result.replace(
        /^(\s*(?:let|const|var)\s+(\w+))\s*:\s*([\w|&[\]\s<>,.]+?)\s*(=|;)/,
        (match, prefix, varName, typeInfo, separator) => {
          // Only remove if it looks like a type annotation
          // Types usually contain uppercase letters, pipes, brackets, or angle brackets
          if (/[|&[\]<>]|^[A-Z]/.test(typeInfo)) {
            return prefix + separator;
          }
          return match; // Keep if doesn't look like a type
        }
      );

      // PATTERN 2: Remove function return types ONLY
      // Match: ): ReturnType { or ): Type | Type2 {
      // Only remove if it looks like a type (has pipes, brackets, uppercase, etc)
      result = result.replace(
        /\)\s*:\s*([\w|&[\]\s<>,.]+?)\s*{/,
        (match, typeInfo) => {
          if (/[|&[\]<>]|^[A-Z]/.test(typeInfo)) {
            return ') {';
          }
          return match;
        }
      );

      // PATTERN 3: Remove function parameter types
      // Match: (param: Type) -> (param)
      // But preserve object literals like { key: value }
      // Only remove if inside parentheses (function params, not object literals)
      if (result.includes('(') && result.includes(')') && result.includes(':')) {
        result = result.replace(
          /\(([^{}]*?)\)/g,
          (match) => {
            // If this looks like function params (not object literal)
            // Remove type annotations
            const cleaned = match.replace(
              /(\w+)\s*:\s*([\w|&[\]\s<>,.]+?)(?=[,)])/g,
              (param, name, typeInfo) => {
                // Only remove if it looks like a type
                if (/[|&[\]<>]|^[A-Z]/.test(typeInfo)) {
                  return name;
                }
                return param;
              }
            );
            return cleaned;
          }
        );
      }

      return result;
    });

    jsScript = processedLines.join('\n');

    // Remove type/interface/enum declarations completely
    jsScript = jsScript
      .replace(/^\s*type\s+\w+[\s\S]*?;/gm, '')
      .replace(/^\s*interface\s+\w+[\s\S]*?^}$/gm, '')
      .replace(/^\s*enum\s+\w+[\s\S]*?^}$/gm, '');

    // Remove generic type parameters < > but be careful
    // Only remove if it looks like <Type> not like < or <=
    jsScript = jsScript.replace(/<([\w|&[\]\s<>,.]+)>/g, (match, content) => {
      // If it has template syntax or looks like a type parameter, remove it
      if (/\w/.test(content) && !/^[<>=]/.test(content)) {
        return '';
      }
      return match;
    });

    return jsScript;
  }
}
