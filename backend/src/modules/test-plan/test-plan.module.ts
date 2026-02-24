import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestPlan, TestScenario } from '../../database/entities';
import { TestPlanService } from './test-plan.service';
import { TestPlanController } from './test-plan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestPlan, TestScenario])],
  controllers: [TestPlanController],
  providers: [TestPlanService],
  exports: [TestPlanService],
})
export class TestPlanModule {}
