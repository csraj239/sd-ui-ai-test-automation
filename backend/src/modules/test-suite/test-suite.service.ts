import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSuite, TestScenario } from '../../database/entities';
import { CreateTestSuiteDto, UpdateTestSuiteDto, AddScenariosDto } from './test-suite.dto';

@Injectable()
export class TestSuiteService {
  constructor(
    @InjectRepository(TestSuite)
    private testSuiteRepository: Repository<TestSuite>,
    @InjectRepository(TestScenario)
    private testScenarioRepository: Repository<TestScenario>,
  ) {}

  async create(createTestSuiteDto: CreateTestSuiteDto): Promise<TestSuite> {
    const testSuite = this.testSuiteRepository.create({
      name: createTestSuiteDto.name,
      description: createTestSuiteDto.description,
    });

    if (createTestSuiteDto.scenarioIds && createTestSuiteDto.scenarioIds.length > 0) {
      const scenarios = await this.testScenarioRepository.findByIds(
        createTestSuiteDto.scenarioIds,
      );
      testSuite.testScenarios = scenarios;
    }

    return this.testSuiteRepository.save(testSuite);
  }

  async findAll(): Promise<TestSuite[]> {
    return this.testSuiteRepository.find({
      relations: ['testScenarios'],
    });
  }

  async findOne(id: string): Promise<TestSuite | null> {
    return this.testSuiteRepository.findOne({
      where: { id },
      relations: ['testScenarios', 'executions'],
    });
  }

  async update(id: string, updateTestSuiteDto: UpdateTestSuiteDto): Promise<TestSuite | null> {
    await this.testSuiteRepository.update(id, updateTestSuiteDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.testSuiteRepository.delete(id);
  }

  async addScenarios(id: string, addScenariosDto: AddScenariosDto): Promise<TestSuite> {
    const testSuite = await this.findOne(id);
    if (!testSuite) throw new Error('TestSuite not found');
    const scenarios = await this.testScenarioRepository.findByIds(
      addScenariosDto.scenarioIds,
    );
    testSuite.testScenarios = [...(testSuite.testScenarios || []), ...scenarios];
    return this.testSuiteRepository.save(testSuite);
  }

  async removeScenario(suiteId: string, scenarioId: string): Promise<TestSuite> {
    const testSuite = await this.findOne(suiteId);
    if (!testSuite) throw new Error('TestSuite not found');
    testSuite.testScenarios = testSuite.testScenarios.filter((s) => s.id !== scenarioId);
    return this.testSuiteRepository.save(testSuite);
  }
}
