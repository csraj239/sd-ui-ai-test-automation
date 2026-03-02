import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { TestScenario } from './test-scenario.entity';
import { UserFlow } from './user-flow.entity';

@Entity('test_plans')
export class TestPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text' })
  navigationFlow!: string;

  @Column({ type: 'text' })
  acceptanceCriteria!: string;

  @Column({ type: 'text', nullable: true })
  prompt!: string;

  @Column({ type: 'text', nullable: true })
  generatedScenarios!: string; // JSON

  @Column({ type: 'uuid' })
  projectId!: string;

  @Column({ type: 'uuid', nullable: true })
  userFlowId!: string; // Selected user flow for this test plan

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Project, (project: any) => project.testPlans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @ManyToOne(() => UserFlow, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userFlowId' })
  userFlow?: UserFlow;

  @OneToMany(() => TestScenario, (scenario: any) => scenario.testPlan, {
    cascade: true,
    eager: false,
  })
  testScenarios!: TestScenario[];
}
