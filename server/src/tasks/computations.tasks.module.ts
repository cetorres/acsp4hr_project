import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from '../requests/entities';
import { ComputationsService } from '../computations/computations.service';
import { Computation } from '../computations/entities/computation.entity';
import { ComputationRun } from '../computations/entities/computation_run.entity';
import { HttpModule } from '@nestjs/axios';
import { ComputationsTasksService } from './computations.tasks.service';
import { Dataset } from '../datasets/entities';
import { User } from '../users/entities';
import { UsersService } from 'src/users/users.service';
import { ComputationSuggestion } from 'src/computations/entities/computation_suggestion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Computation, Request, ComputationRun, Dataset, User, ComputationSuggestion]),
    HttpModule
  ],
  providers: [ComputationsTasksService, ComputationsService, UsersService]
})
export class ComputationsTasksModule {}
