import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestExecution, TestScenario, TestSuite } from '../../database/entities';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { ExecutionProcessor } from './execution.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'test-execution',
    }),
    TypeOrmModule.forFeature([TestExecution, TestScenario, TestSuite]),
  ],
  controllers: [ExecutionController],
  providers: [ExecutionService, ExecutionProcessor],
  exports: [ExecutionService],
})
export class ExecutionModule {}
