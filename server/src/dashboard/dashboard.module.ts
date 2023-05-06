import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetsService } from '../datasets/datasets.service';
import { UsersService } from '../users/users.service';
import { VaultService } from '../vault/vault.service';
import { Dataset } from '../datasets/entities';
import { User } from '../users/entities';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Variable } from 'src/datasets/entities/variable.entity';
import { Favorite } from 'src/datasets/entities/favorite.entity';
import { RequestsService } from 'src/requests/requests.service';
import { Request } from '../requests/entities';
import { ComputationsService } from 'src/computations/computations.service';
import { ComputationRun } from 'src/computations/entities/computation_run.entity';
import { Computation } from 'src/computations/entities/computation.entity';
import { ComputationSuggestion } from 'src/computations/entities/computation_suggestion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dataset]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Request]),
    TypeOrmModule.forFeature([Variable]),
    TypeOrmModule.forFeature([Favorite]),
    TypeOrmModule.forFeature([Computation]),
    TypeOrmModule.forFeature([ComputationRun]),
    TypeOrmModule.forFeature([ComputationSuggestion]),
    HttpModule
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    UsersService,
    DatasetsService,
    RequestsService,
    ComputationsService,
    VaultService,
    ConfigService
  ]
})
export class DashboardModule {}
