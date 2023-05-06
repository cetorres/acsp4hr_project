import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ComputationRun } from './computation_run.entity';

export enum ComputationReturnType {
  Text = 1,
  Graph = 2,
  TextAndGraph = 3
}

@Entity({ name: 'computations' })
export class Computation {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'computation_id'
  })
  id: number;

  @Column({
    nullable: false
  })
  name: string;

  @Column({
    nullable: false
  })
  description: string;

  @Column({
    nullable: false,
    name: 'script_command'
  })
  scriptCommand: string;

  @Column({
    nullable: false,
    name: 'return_type'
  })
  returnType: ComputationReturnType;

  @Column({
    nullable: false,
    default: 0,
    name: 'number_of_variables'
  })
  numberOfVariables: number;

  @Column({
    name: 'is_active',
    nullable: false,
    default: true
  })
  isActive: boolean;

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

  @OneToMany(() => ComputationRun, (cr) => cr.computation)
  computationRuns: ComputationRun[];
}
