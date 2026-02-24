import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestScenario } from '../../database/entities';
import { TestScenarioService } from './test-scenario.service';
import { TestScenarioController } from './test-scenario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestScenario])],
  controllers: [TestScenarioController],
  providers: [TestScenarioService],
  exports: [TestScenarioService],
})
export class TestScenarioModule {}
