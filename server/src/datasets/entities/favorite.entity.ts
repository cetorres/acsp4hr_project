import { Dataset } from 'src/datasets/entities';
import { User } from 'src/users/entities';
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'favorites' })
export class Favorite {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'favorite_id'
  })
  id: number;

  @ManyToOne(() => Dataset)
  @JoinColumn({
    name: 'dataset_id'
  })
  dataset: Dataset;

  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({
    name: 'user_id'
  })
  user: User;

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
