import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetsService } from 'src/datasets/datasets.service';
import { Favorite, Variable } from 'src/datasets/entities';
import { Dataset } from 'src/datasets/entities/dataset.entity';
import { User } from 'src/users/entities';
import { UsersService } from 'src/users/users.service';
import { VaultService } from 'src/vault/vault.service';
import { Request } from './entities';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request]),
    TypeOrmModule.forFeature([Dataset]),
    TypeOrmModule.forFeature([Variable]),
    TypeOrmModule.forFeature([Favorite]),
    TypeOrmModule.forFeature([User]),
    HttpModule
  ],
  controllers: [RequestsController],
  providers: [RequestsService, ConfigService, UsersService, DatasetsService, VaultService]
})
export class RequestsModule {}
