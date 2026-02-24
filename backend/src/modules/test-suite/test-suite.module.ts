import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSuite, TestScenario } from '../../database/entities';
import { TestSuiteService } from './test-suite.service';
import { TestSuiteController } from './test-suite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestSuite, TestScenario])],
  controllers: [TestSuiteController],
  providers: [TestSuiteService],
  exports: [TestSuiteService],
})
export class TestSuiteModule {}
