import { Dataset } from 'src/datasets/entities';
import { Request } from 'src/requests/entities';
import { User } from 'src/users/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Computation } from './computation.entity';

export enum ComputationRunStatus {
  Pending = 0,
  Running = 1,
  Success = 2,
  Error = 3
}

@Entity({ name: 'computation_runs' })
export class ComputationRun {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'computation_run_id'
  })
  id: number;

  @ManyToOne(() => Request, (request) => request.computationRuns, {
    nullable: true,
    lazy: true
  })
  @JoinColumn({
    name: 'request_id'
  })
  request?: Request;

  @ManyToOne(() => Dataset, (dataset) => dataset.computationRuns, {
    nullable: true,
    lazy: true
  })
  @JoinColumn({
    name: 'dataset_id'
  })
  dataset?: Dataset;

  @ManyToOne(() => User, (user) => user.computationRuns, {
    nullable: true,
    lazy: true
  })
  @JoinColumn({
    name: 'runner_id'
  })
  runner?: User;

  @ManyToOne(() => Computation, (computation) => computation.computationRuns, {
    nullable: false,
    lazy: true
  })
  @JoinColumn({
    name: 'computation_id'
  })
  computation: Computation;

  @Column({
    nullable: true,
    name: 'result_text'
  })
  resultText?: string;

  @Column({
    nullable: true,
    name: 'result_image'
  })
  resultImage?: string;

  @Column({
    nullable: false,
    name: 'run_status',
    default: ComputationRunStatus.Pending
  })
  runStatus: ComputationRunStatus;

  @Column({
    nullable: true,
    name: 'variables'
  })
  variables?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp'
  })
  updatedAt: Date;
}
