import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('execution_reports')
export class ExecutionReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', default: 0 })
  totalTests!: number;

  @Column({ type: 'int', default: 0 })
  passedTests!: number;

  @Column({ type: 'int', default: 0 })
  failedTests!: number;

  @Column({ type: 'int', default: 0 })
  skippedTests!: number;

  @Column({ type: 'float', nullable: true })
  successRate!: number; // percentage

  @Column({ type: 'int', nullable: true })
  totalDuration!: number; // in milliseconds

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ type: 'text', nullable: true })
  artifactPath!: string; // Path to artifacts folder

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
