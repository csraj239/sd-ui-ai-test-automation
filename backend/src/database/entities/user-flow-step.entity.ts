import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserFlow } from './user-flow.entity';

@Entity('user_flow_steps')
export class UserFlowStep {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  stepNumber!: number;

  @Column({ type: 'varchar', length: 50 })
  action!: string; // Launch, Click, Enter, Hover, verifyText, CloseBrowser

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text', nullable: true })
  page!: string; // Page name or URL

  @Column({ type: 'text', nullable: true })
  locator!: string; // CSS selector or XPath

  @Column({ type: 'text', nullable: true })
  data!: string; // Data to enter or verify

  @Column({ type: 'uuid' })
  userFlowId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => UserFlow, (userFlow: any) => userFlow.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userFlowId' })
  userFlow!: UserFlow;
}
