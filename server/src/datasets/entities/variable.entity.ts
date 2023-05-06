import { Dataset } from 'src/datasets/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'variables' })
export class Variable {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'variable_id'
  })
  id: number;

  @ManyToOne(() => Dataset, (dataset) => dataset.variables, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({
    name: 'dataset_id'
  })
  dataset: Dataset;

  @Column({
    nullable: false
  })
  name: string;

  @Column({
    nullable: true
  })
  description: string;

  @Column({
    nullable: false
  })
  type: string;

  @Column({
    nullable: false
  })
  order: number;

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
