import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { TestPlan } from './test-plan.entity';
import { TestSuite } from './test-suite.entity';

@Entity('test_scenarios')
export class TestScenario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text', nullable: true })
  playwrightScript!: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status!: string; // draft, approved, executed, failed

  @Column({ type: 'simple-json', nullable: true })
  steps!: string[];

  @Column({ type: 'text', nullable: true })
  expectedOutput!: string;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'medium' })
  priority!: 'high' | 'medium' | 'low';

  @Column({ type: 'uuid', nullable: true })
  testPlanId!: string;

  @Column({ type: 'int', default: 0 })
  executionCount!: number;

  @Column({ type: 'int', default: 0 })
  passCount!: number;

  @Column({ type: 'int', default: 0 })
  failCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => TestPlan, (testPlan: any) => testPlan.testScenarios, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'testPlanId' })
  testPlan!: TestPlan;

  @ManyToMany(() => TestSuite, (testSuite: any) => testSuite.testScenarios)
  testSuites!: TestSuite[];
}
