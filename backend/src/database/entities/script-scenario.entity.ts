import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('script_scenarios')
export class ScriptScenario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text', nullable: true })
  playwrightScript!: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status!: string; // draft, executed, passed, failed

  @Column({ type: 'simple-json', nullable: true })
  steps!: string[];

  @Column({ type: 'text', nullable: true })
  expectedOutput!: string;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'medium' })
  priority!: 'high' | 'medium' | 'low';

  @Column({ type: 'int', default: 0 })
  executionCount!: number;

  @Column({ type: 'int', default: 0 })
  passCount!: number;

  @Column({ type: 'int', default: 0 })
  failCount!: number;

  @Column({ type: 'uuid', nullable: true })
  projectId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
