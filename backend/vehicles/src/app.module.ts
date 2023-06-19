import 'dotenv/config';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { CommonModule } from './modules/common/common.module';
import * as path from 'path';
import { AppController } from './app.controller';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { PowerUnitTypesModule } from './modules/vehicles/power-unit-types/power-unit-types.module';
import { PowerUnitsModule } from './modules/vehicles/power-units/power-units.module';
import { TrailerTypesModule } from './modules/vehicles/trailer-types/trailer-types.module';
import { TrailersModule } from './modules/vehicles/trailers/trailers.module';
import { UsersModule } from './modules/company-user-management/users/users.module';
import { CompanyModule } from './modules/company-user-management/company/company.module';
import { PendingUsersModule } from './modules/company-user-management/pending-users/pending-users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PermitModule } from './modules/permit/permit.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { EmailModule } from './modules/email/email.module';

const envPath = path.resolve(process.cwd() + '/../../');

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${envPath}/.env` }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE === 'mssql' ? 'mssql' : 'postgres',
      host:
        process.env.DB_TYPE === 'mssql'
          ? process.env.MSSQL_HOST
          : process.env.POSTGRESQL_HOST,
      port:
        process.env.DB_TYPE === 'mssql'
          ? parseInt(process.env.MSSQL_PORT)
          : 5432,
      database:
        process.env.DB_TYPE === 'mssql'
          ? process.env.MSSQL_DB
          : process.env.POSTGRESQL_DATABASE,
      username:
        process.env.DB_TYPE === 'mssql'
          ? process.env.MSSQL_SA_USER
          : process.env.POSTGRESQL_USER,
      password:
        process.env.DB_TYPE === 'mssql'
          ? process.env.MSSQL_SA_PASSWORD
          : process.env.POSTGRESQL_PASSWORD,
      options: { encrypt: process.env.MSSQL_ENCRYPT === 'true' },
      autoLoadEntities: true, // Auto load all entities regiestered by typeorm forFeature method.
      synchronize: false, // This changes the DB schema to match changes to entities, which we might not want.
      logging: false,
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    CacheModule.register({
      max: 400, // TODO: change this once we refactor the cache structure
      ttl: 0, // disable expiration of the cache
      isGlobal: true, // Allows access to cache manager globally
    }),
    PowerUnitsModule,
    TrailersModule,
    PowerUnitTypesModule,
    TrailerTypesModule,
    CompanyModule,
    UsersModule,
    CommonModule,
    PendingUsersModule,
    AuthModule,
    PermitModule,
    PdfModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly appService: AppService) {}

  onApplicationBootstrap() {
    this.appService.initializeCache().catch((err) => {
      console.error('Cache initialization failed:', err);
    });
  }
}
