import { Module } from '@nestjs/common';
import { PlaywrightController } from './playwright.controller';
import { PlaywrightGeneratorService } from '@/services/playwright-generator.service';

@Module({
  controllers: [PlaywrightController],
  providers: [PlaywrightGeneratorService],
  exports: [PlaywrightGeneratorService],
})
export class PlaywrightModule {}
