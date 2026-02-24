import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TestScenario } from './test-scenario.entity';
import { TestSuite } from './test-suite.entity';
import { ExecutionReport } from './execution-report.entity';

@Entity('test_executions')
export class TestExecution {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  status!: string; // pending, running, passed, failed, skipped

  @Column({ type: 'text', nullable: true })
  errorMessage!: string;

  @Column({ type: 'text', nullable: true })
  screenshotPath!: string;

  @Column({ type: 'text', nullable: true })
  videoPath!: string;

  @Column({ type: 'int', nullable: true })
  duration!: number; // in milliseconds

  @CreateDateColumn()
  startedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  scenarioId!: string;

  @Column({ type: 'uuid', nullable: true })
  suiteId!: string;

  @Column({ type: 'uuid', nullable: true })
  reportId!: string;

  @ManyToOne(() => TestScenario, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'scenarioId' })
  testScenario!: TestScenario;

  @ManyToOne(() => TestSuite, (suite: any) => suite.executions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'suiteId' })
  testSuite!: TestSuite;

  @OneToOne(() => ExecutionReport, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report!: ExecutionReport;
}
