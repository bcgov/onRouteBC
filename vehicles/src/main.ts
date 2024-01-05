import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http.filter';
import { FallbackExceptionFilter } from './common/filters/fallback.filter';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { BadRequestExceptionDto } from './common/exception/badRequestException.dto';
import { ExceptionDto } from './common/exception/exception.dto';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { customLogger } from './common/logger/logger.config';
import { CorrelationIdInterceptor } from './common/interceptor/correlationId.interceptor';

const allowedOrigins = [
  process.env.DOPS_URL,
  process.env.FRONTEND_URL,
  process.env.ACCESS_API_URL,
  'localhost'
];

// if (process.env.LOCALHOST_DOMAIN) {
//   allowedOrigins.push(process.env.LOCALHOST_DOMAIN);
// }

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: customLogger,
  });
  app.use(helmet());
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    maxAge: 7200,
    credentials: false,
    exposedHeaders: ['Content-Disposition', 'x-correlation-id'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (e) => {
        const badRequestExceptionList: BadRequestExceptionDto[] = [];
        e.forEach((error) => {
          const badRequestExceptionDto = new BadRequestExceptionDto();
          // TODO : Handle Validations of an Array of Nested/Child Objects
          badRequestExceptionDto.field = error.children[0]
            ? error.property.concat('.', error.children[0]?.property.toString())
            : error.property;
          badRequestExceptionDto.message = Object.values(
            error.children[0]
              ? error.children[0].constraints
              : error.constraints,
          );
          badRequestExceptionList.push(badRequestExceptionDto);
        });
        const exceptionDto = new ExceptionDto(
          HttpStatus.BAD_REQUEST,
          'Bad Request',
          badRequestExceptionList,
        );
        throw new BadRequestException(exceptionDto);
      },
      forbidUnknownValues: true,
      validationError: { target: false },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Vehicles API')
    .setDescription('The vehicles API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  app.useGlobalFilters(
    new FallbackExceptionFilter(),
    new HttpExceptionFilter(),
  );

  app.useGlobalInterceptors(new CorrelationIdInterceptor());

  await app.listen(5000);
}
void bootstrap();
