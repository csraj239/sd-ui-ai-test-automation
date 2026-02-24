import {
  Controller,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlaywrightGeneratorService } from '@/services/playwright-generator.service';

@ApiTags('Playwright Generation')
@Controller('api/playwright')
export class PlaywrightController {
  constructor(private readonly playwrightService: PlaywrightGeneratorService) {}

  @Post('generate')
  async generateScript(
    @Body()
    body: {
      appUrl: string;
      navigationFlow: string;
      acceptanceCriteria: string;
      steps?: string[];
    },
  ) {
    if (!body.appUrl || !body.navigationFlow || !body.acceptanceCriteria) {
      throw new BadRequestException(
        'appUrl, navigationFlow, and acceptanceCriteria are required',
      );
    }

    try {
      const script = await this.playwrightService.generateScriptWithLocators(body);
      return {
        success: true,
        script,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
      };
    }
  }

  @Post('execute')
  async executeScript(@Body() body: { script: string }) {
    if (!body.script) {
      throw new BadRequestException('script is required');
    }

    try {
      const result = await this.playwrightService.executeScript(body.script);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
      };
    }
  }
}
