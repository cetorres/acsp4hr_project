import { User } from 'src/users/entities';
import { Variable } from './variable.entity';
import { Request } from 'src/requests/entities/request.entity';
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
import { ComputationRun } from 'src/computations/entities/computation_run.entity';

@Entity({ name: 'datasets' })
export class Dataset {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'dataset_id'
  })
  id: number;

  @ManyToOne(() => User, (user) => user.datasets, {
    nullable: false,
    lazy: true
  })
  @JoinColumn({
    name: 'user_id'
  })
  user: User;

  @Column({
    nullable: false
  })
  name: string;

  @Column({
    nullable: false
  })
  description: string;

  @Column({
    name: 'document_name',
    nullable: true
  })
  documentName: string;

  @Column({
    name: 'filename',
    nullable: true
  })
  filename: string;

  @Column({
    name: 'document_size',
    nullable: true
  })
  documentSize: number;

  @Column({
    name: 'rows',
    nullable: true
  })
  rows: number;

  @Column({
    name: 'is_active',
    nullable: false,
    default: true
  })
  isActive: boolean;

  @Column({
    name: 'keywords',
    nullable: true
  })
  keywords: string;

  @Column({
    name: 'requires_permission',
    nullable: false,
    default: true
  })
  requiresPermission: boolean;

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

  @OneToMany(() => Variable, (variable) => variable.dataset, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  variables: Variable[];

  @OneToMany(() => Request, (request) => request.dataset)
  requests: Request[];

  @OneToMany(() => ComputationRun, (cr) => cr.request)
  computationRuns: ComputationRun[];
}
