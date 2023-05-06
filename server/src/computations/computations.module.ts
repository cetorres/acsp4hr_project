import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dataset } from 'src/datasets/entities';
import { Request } from 'src/requests/entities';
import { User } from 'src/users/entities';
import { UsersService } from 'src/users/users.service';
import { ComputationsController } from './computations.controller';
import { ComputationsService } from './computations.service';
import { Computation } from './entities/computation.entity';
import { ComputationRun } from './entities/computation_run.entity';
import { ComputationSuggestion } from './entities/computation_suggestion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Computation, ComputationRun, Request, Dataset, User, ComputationSuggestion]),
    HttpModule
  ],
  controllers: [ComputationsController],
  providers: [ComputationsService, UsersService]
})
export class ComputationsModule {}
