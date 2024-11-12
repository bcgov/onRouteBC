import 'dotenv/config';
import {
  Logger,
  MiddlewareConsumer,
  Module,
  OnApplicationBootstrap,
  RequestMethod,
} from '@nestjs/common';
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
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { HTTPLoggerMiddleware } from './common/middleware/req.res.logger';
import { TypeormCustomLogger } from './common/logger/typeorm-logger.config';
import { getTypeormLogLevel } from './common/helper/logger.helper';
import { ClsModule } from 'nestjs-cls';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CompanySuspendModule } from './modules/company-user-management/company-suspend/company-suspend.module';
import { PermitModule } from './modules/permit-application-payment/permit/permit.module';
import { ApplicationModule } from './modules/permit-application-payment/application/application.module';
import { PaymentModule } from './modules/permit-application-payment/payment/payment.module';
import { PermitReceiptDocumentModule } from './modules/permit-application-payment/permit-receipt-document/permit-receipt-document.module';
import { ShoppingCartModule } from './modules/shopping-cart/shopping-cart.module';
import { CreditAccountModule } from './modules/credit-account/credit-account.module';
import { SpecialAuthModule } from './modules/special-auth/special-auth.module';
import { CaseManagementModule } from './modules/case-management/case-management.module';

const envPath = path.resolve(process.cwd() + '/../');

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${envPath}/.env` }),
    // Register the ClsModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        // automatically mount the
        // ClsMiddleware for all routes
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => {
          const correlationId = req.headers['x-correlation-id'];
          return Array.isArray(correlationId)
            ? correlationId[0]
            : (correlationId ?? uuidv4());
        },
      },
    }),
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
        +process.env.VEHICLES_API_MAX_QUERY_EXECUTION_TIME_MS || 5000, //5 seconds by default
      logger: new TypeormCustomLogger(
        getTypeormLogLevel(process.env.VEHICLES_API_TYPEORM_LOG_LEVEL),
      ),
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    CacheModule.register({
      max: 50, //Max cache items in store. Revisit the number when required.
      ttl: 0, // disable expiration of the cache.
      isGlobal: true, // Allows access to cache manager globally.
    }),
    PowerUnitsModule,
    TrailersModule,
    PowerUnitTypesModule,
    TrailerTypesModule,
    CompanyModule,
    CompanySuspendModule,
    UsersModule,
    CommonModule,
    PendingUsersModule,
    AuthModule,
    PaymentModule,
    ShoppingCartModule,
    PermitReceiptDocumentModule,
    ApplicationModule, //! Application Module should be imported before PermitModule to avoid URI conflict
    PermitModule,
    CreditAccountModule,
    FeatureFlagsModule,
    SpecialAuthModule,
    CaseManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name);
  constructor(private readonly appService: AppService) {}
  // let's add a middleware on all routes
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HTTPLoggerMiddleware)
      .exclude({ path: '/', method: RequestMethod.GET })
      .forRoutes('*');
  }
  async onApplicationBootstrap() {
    await this.appService.initializeCache().catch((err) => {
      this.logger.error('Cache initialization failed:', err);
    });
  }
}
