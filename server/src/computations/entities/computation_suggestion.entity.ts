import { User } from '../../users/entities';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'computation_suggestions' })
export class ComputationSuggestion {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'computation_suggestion_id'
  })
  id: number;

  @Column({
    nullable: false,
    name: 'suggestion'
  })
  suggestion: string;

  @ManyToOne(() => User, (user) => user.computationSuggestions, {
    nullable: true,
    lazy: true
  })
  @JoinColumn({
    name: 'user_id'
  })
  user?: User;

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
