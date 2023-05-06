import { ComputationRun } from 'src/computations/entities/computation_run.entity';
import { Dataset } from 'src/datasets/entities';
import { User } from 'src/users/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

export enum RequestStatus {
  Pending = 0,
  Granted = 1,
  Denied = 2
}

@Entity({ name: 'requests' })
export class Request {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'request_id'
  })
  id: number;

  @ManyToOne(() => User, (user) => user.my_requests, {
    nullable: false,
    lazy: true
  })
  @JoinColumn({
    name: 'requester_id'
  })
  requester: User;

  @ManyToOne(() => User, (user) => user.requests_to_me, {
    nullable: false,
    lazy: true
  })
  @JoinColumn({
    name: 'owner_id'
  })
  owner: User;

  @ManyToOne(() => Dataset, (dataset) => dataset.requests, {
    nullable: false,
    lazy: true
  })
  @JoinColumn({
    name: 'dataset_id'
  })
  dataset: Dataset;

  @Column({
    nullable: false
  })
  description: string;

  @Column({
    name: 'status',
    nullable: false,
    default: RequestStatus.Pending
  })
  status: RequestStatus;

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

  @OneToMany(() => ComputationRun, (cr) => cr.request)
  computationRuns: ComputationRun[];
}
