import { Request } from 'src/requests/entities/request.entity';
import { Dataset } from 'src/datasets/entities/dataset.entity';
import { Favorite } from 'src/datasets/entities/favorite.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { ComputationRun } from 'src/computations/entities/computation_run.entity';
import { ComputationSuggestion } from 'src/computations/entities/computation_suggestion.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_id'
  })
  id: number;

  @Column({
    name: 'first_name',
    nullable: false
  })
  firstName: string;

  @Column({
    name: 'last_name',
    nullable: false
  })
  lastName: string;

  @Column({
    nullable: true,
    type: 'text'
  })
  bio: string;

  @Column({
    nullable: false,
    unique: true
  })
  email: string;

  @Column({
    nullable: false
  })
  password: string;

  @Column({
    name: 'salt',
    nullable: true
  })
  salt: string;

  @Column({
    name: 'secure_token',
    nullable: true
  })
  secureToken: string;

  @Column({
    name: 'verification_code',
    nullable: true
  })
  verificationCode: string;

  @Column({
    name: 'is_active',
    nullable: false,
    default: true
  })
  isActive: boolean;

  @Column({
    name: 'is_admin',
    nullable: false,
    default: false
  })
  isAdmin: boolean;

  @Column({
    name: 'last_login',
    type: 'timestamp',
    nullable: true
  })
  lastLogin: Date;

  @Column({
    name: 'jwt_token',
    nullable: true
  })
  jwtToken: string;

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

  @DeleteDateColumn({
    name: 'delete_at',
    type: 'timestamp',
    select: false
  })
  deletedAt: Date;

  @OneToMany(() => Dataset, (dataset) => dataset.user)
  datasets: Dataset[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Request, (request) => request.requester)
  my_requests: Request[];

  @OneToMany(() => Request, (request) => request.owner)
  requests_to_me: Request[];

  @OneToMany(() => ComputationRun, (cr) => cr.runner)
  computationRuns: ComputationRun[];

  @OneToMany(() => ComputationSuggestion, (cs) => cs.user)
  computationSuggestions: ComputationSuggestion[];
}
