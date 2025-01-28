import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { TpsPermitModule } from './modules/tps-permit/tps-permit.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeormCustomLogger } from './common/logger/typeorm-logger.config';
import { getTypeormLogLevel } from './common/helper/logger.helper';
import { CacheModule } from '@nestjs/cache-manager';
import { CgiSftpModule } from './modules/cgi-sftp/cgi-sftp.module';
import { PermitModule } from './modules/permit/permit.module';

const envPath = path.resolve(process.cwd() + '/../');
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ envFilePath: `${envPath}/.env` }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.MSSQL_HOST,
      port: parseInt(process.env.MSSQL_PORT),
      database: process.env.MSSQL_DB,
      username: process.env.MSSQL_SA_USER,
      password: process.env.MSSQL_SA_PASSWORD,
      options: { encrypt: process.env.MSSQL_ENCRYPT === 'true', useUTC: true },
      autoLoadEntities: true, // Auto load all entities regiestered by typeorm forFeature method.
      synchronize: false, // This changes the DB schema to match changes to entities, which we might not want.
      maxQueryExecutionTime:
        +process.env.SCHEDULER_API_MAX_QUERY_EXECUTION_TIME_MS || 5000, //5 seconds by default
      logger: new TypeormCustomLogger(
        getTypeormLogLevel(process.env.SCHEDULER_API_TYPEORM_LOG_LEVEL),
      ),
      pool: { max: +process.env.SCHEDULER_API_MSSQL_MAX_CONNECTION || 10 },
    }),
    CacheModule.register({
      max: 50, //Max cache items in store. Revisit the number when required.
      ttl: 0, // disable expiration of the cache.
      isGlobal: true, // Allows access to cache manager globally.
    }),
    TpsPermitModule,
    FeatureFlagsModule,
    CgiSftpModule,
    PermitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
