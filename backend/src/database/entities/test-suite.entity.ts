import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { TestScenario } from './test-scenario.entity';
import { TestExecution } from './test-execution.entity';

@Entity('test_suites')
export class TestSuite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToMany(() => TestScenario, {
    eager: false,
    cascade: false,
  })
  @JoinTable({
    name: 'test_suite_scenarios',
    joinColumn: { name: 'suiteId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'scenarioId', referencedColumnName: 'id' },
  })
  testScenarios!: TestScenario[];

  @OneToMany(() => TestExecution, (execution: any) => execution.testSuite, {
    cascade: true,
  })
  executions!: TestExecution[];
}
