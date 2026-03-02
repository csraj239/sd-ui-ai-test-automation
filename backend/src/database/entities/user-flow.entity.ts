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
import { UserFlowStep } from './user-flow-step.entity';

@Entity('user_flows')
export class UserFlow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'uuid' })
  projectId!: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status!: string; // draft, saved, executing, executed, failed

  @Column({ type: 'text', nullable: true })
  executionResult!: string; // JSON - contains DOM, accessibility info, screenshots, etc.

  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Project, (project: any) => project.userFlows, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @OneToMany(() => UserFlowStep, (step: any) => step.userFlow, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  steps!: UserFlowStep[];
}
