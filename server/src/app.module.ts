import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ComputationsModule } from './computations/computations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatasetsModule } from './datasets/datasets.module';
import { RequestsModule } from './requests/requests.module';
import { UsersModule } from './users/users.module';
import { VaultModule } from './vault/vault.module';
import { ComputationsTasksModule } from './tasks/computations.tasks.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'client', 'dist'),
      exclude: ['/api*', '/docs*']
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      synchronize: process.env.ENV == 'DEV' ? true : false,
      logging: process.env.ENV == 'DEV' ? true : false,
      migrations: [__dirname + '/migrations/*{.js,.ts}'],
      migrationsTableName: 'migrations_history',
      migrationsRun: true
    } as TypeOrmModuleOptions),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    DatasetsModule,
    RequestsModule,
    ComputationsModule,
    ComputationsTasksModule,
    DashboardModule,
    VaultModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
