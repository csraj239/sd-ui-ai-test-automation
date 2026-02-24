import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './modules/project/project.module';
import { TestPlanModule } from './modules/test-plan/test-plan.module';
import { TestScenarioModule } from './modules/test-scenario/test-scenario.module';
import { ScriptScenarioModule } from './modules/script-scenario/script-scenario.module';
import { TestSuiteModule } from './modules/test-suite/test-suite.module';
import { ExecutionModule } from './modules/execution/execution.module';
import { ReportModule } from './modules/report/report.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlaywrightModule } from './modules/playwright/playwright.module';
import { DatabaseModule } from './database/database.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    QueueModule,
    AuthModule,
    ProjectModule,
    TestPlanModule,
    TestScenarioModule,
    ScriptScenarioModule,
    TestSuiteModule,
    ExecutionModule,
    ReportModule,
    PlaywrightModule,
  ],
})
export class AppModule {}
