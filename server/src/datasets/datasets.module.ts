import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities';
import { UsersService } from 'src/users/users.service';
import { VaultService } from '../vault/vault.service';
import { DatasetsController } from './datasets.controller';
import { DatasetsService } from './datasets.service';
import { Dataset } from './entities';
import { Favorite } from './entities/favorite.entity';
import { Variable } from './entities/variable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dataset]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Variable]),
    TypeOrmModule.forFeature([Favorite]),
    HttpModule
  ],
  controllers: [DatasetsController],
  providers: [DatasetsService, VaultService, ConfigService, UsersService]
})
export class DatasetsModule {}
