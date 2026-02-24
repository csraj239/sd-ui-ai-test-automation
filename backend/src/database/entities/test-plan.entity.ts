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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Project, (project: any) => project.testPlans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @OneToMany(() => TestScenario, (scenario: any) => scenario.testPlan, {
    cascade: true,
    eager: false,
  })
  testScenarios!: TestScenario[];
}
