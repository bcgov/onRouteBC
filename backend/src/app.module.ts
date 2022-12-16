import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiclesModule } from './vehicles/vehicles.module';


console.log('Var check - DB_TYPE', process.env.DB_TYPE);
console.log('Var check - POSTGRESQL_HOST', process.env.POSTGRESQL_HOST);
console.log('Var check - POSTGRESQL_DATABASE', process.env.POSTGRESQL_DATABASE);
console.log('Var check - POSTGRESQL_USER', process.env.POSTGRESQL_USER);
if (process.env.POSTGRESQL_PASSWORD != null) {
  console.log('Var check - POSTGRESQL_PASSWORD present');
} else {
  console.log('Var check - POSTGRESQL_PASSWORD not present');
}
console.log('Var check - MSSQL_HOST', process.env.MSSQL_HOST);
console.log('Var check - MSSQL_PORT', process.env.MSSQL_PORT);
console.log('Var check - MSSQL_DB', process.env.MSSQL_DB);
console.log('Var check - MSSQL_SA_USER', process.env.MSSQL_SA_USER);
console.log('Var check - MSSQL_SA_PASSWORD', process.env.MSSQL_SA_PASSWORD);


console.log('Var check - DB_TYPE',process.env.DB_TYPE==='mssql'?'mssql':'postgres');
console.log('Var check - DB_HOST', process.env.DB_TYPE === 'mssql'? process.env.MSSQL_HOST: process.env.POSTGRESQL_HOST);
console.log('Var check - DB_PORT', process.env.DB_TYPE === 'mssql'? parseInt(process.env.MSSQL_PORT):5432);
console.log('Var check - DB_DATABASE', process.env.DB_TYPE === 'mssql'? process.env.MSSQL_DB : process.env.POSTGRESQL_DATABASE);
console.log('Var check - DB_USERNAME', process.env.DB_TYPE === 'mssql'? process.env.MSSQL_SA_USER : process.env.POSTGRESQL_USER);
console.log('Var check - DB_PASSWORD', process.env.DB_TYPE === 'mssql'? process.env.MSSQL_SA_PASSWORD : process.env.POSTGRESQL_PASSWORD);

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({ 
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      database: 'onroutebc',
      username: 'SA',
      password: 'YourStrong@Passw0rd',
      options: { encrypt: false },
      // entities: [User],
      autoLoadEntities: true, // Auto load all entities regiestered by typeorm forFeature method.
      synchronize: true, // This changes the DB schema to match changes to entities, which we might not want.
    }),
    VehiclesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
