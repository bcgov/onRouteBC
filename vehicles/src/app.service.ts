import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PowerUnitTypesService } from './modules/vehicles/power-unit-types/power-unit-types.service';
import { TrailerTypesService } from './modules/vehicles/trailer-types/trailer-types.service';
import { CommonService } from './modules/common/common.service';
import { PermitService } from './modules/permit-application-payment/permit/permit.service';
import * as fs from 'fs';
import { CacheKey } from './common/enum/cache-key.enum';
import { addToCache, createCacheMap } from './common/helper/cache.helper';
import { PaymentService } from './modules/permit-application-payment/payment/payment.service';
import { LogAsyncMethodExecution } from './common/decorator/log-async-method-execution.decorator';
import { FeatureFlagsService } from './modules/feature-flags/feature-flags.service';
import { ApplicationService } from './modules/permit-application-payment/application/application.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private permitTypeService: PermitService,
    private powerUnitTypeService: PowerUnitTypesService,
    private trailerTypeService: TrailerTypesService,
    private commonService: CommonService,
    private paymentService: PaymentService,
    private featureFlagsService: FeatureFlagsService,
    private applicationService: ApplicationService,
  ) {}

  getHello(): string {
    return 'Vehicles Healthcheck!';
  }

  @LogAsyncMethodExecution({ printMemoryStats: true })
  async initializeCache() {
    const startDateTime = new Date();
    const countries = await this.commonService.findAllCountries();
    await addToCache(
      this.cacheManager,
      CacheKey.COUNTRY,
      createCacheMap(countries, 'countryCode', 'countryName'),
    );

    const provinces = await this.commonService.findAllProvinces();
    await addToCache(
      this.cacheManager,
      CacheKey.PROVINCE,
      createCacheMap(provinces, 'provinceCode', 'provinceName'),
    );

    const permitTypes = await this.permitTypeService.findAllPermitTypes();
    await addToCache(
      this.cacheManager,
      CacheKey.PERMIT_TYPE,
      createCacheMap(permitTypes, 'permitTypeId', 'name'),
    );

    await addToCache(
      this.cacheManager,
      CacheKey.PERMIT_TYPE_GL_CODE,
      createCacheMap(permitTypes, 'permitTypeId', 'glCode'),
    );

    const powerUnitTypes = await this.powerUnitTypeService.findAll();
    await addToCache(
      this.cacheManager,
      CacheKey.POWER_UNIT_TYPE,
      createCacheMap(powerUnitTypes, 'typeCode', 'type'),
    );

    const trailerTypes = await this.trailerTypeService.findAll();
    await addToCache(
      this.cacheManager,
      CacheKey.TRAILER_TYPE,
      createCacheMap(trailerTypes, 'typeCode', 'type'),
    );

    const vehicleTypesMap = new Map<string, string>();
    vehicleTypesMap.set('powerUnit', 'Power Unit');
    vehicleTypesMap.set('trailer', 'Trailer');

    await addToCache(this.cacheManager, CacheKey.VEHICLE_TYPE, vehicleTypesMap);

    const paymentMethods =
      await this.paymentService.findAllPaymentMethodTypeEntities();
    await addToCache(
      this.cacheManager,
      CacheKey.PAYMENT_METHOD_TYPE,
      createCacheMap(paymentMethods, 'paymentMethodTypeCode', 'name'),
    );

    await addToCache(
      this.cacheManager,
      CacheKey.PAYMENT_METHOD_TYPE_GL_PROJ_CODE,
      createCacheMap(paymentMethods, 'paymentMethodTypeCode', 'glProjCode'),
    );

    const paymentTypes =
      await this.paymentService.findAllPaymentCardTypeEntities();
    await addToCache(
      this.cacheManager,
      CacheKey.PAYMENT_CARD_TYPE,
      createCacheMap(paymentTypes, 'paymentCardTypeCode', 'name'),
    );

    const featureFlags = await this.featureFlagsService.findAll();
    await addToCache(
      this.cacheManager,
      CacheKey.FEATURE_FLAG_TYPE,
      createCacheMap(featureFlags, 'featureKey', 'featureValue'),
    );

    const permitApplicationOrigins =
      await this.applicationService.findAllPermitApplicationOrigin();
    await addToCache(
      this.cacheManager,
      CacheKey.PERMIT_APPLICATION_ORIGIN,
      createCacheMap(permitApplicationOrigins, 'id', 'code'),
    );

    const permitApprovalSource =
      await this.applicationService.findAllPermitApprovalSource();
    await addToCache(
      this.cacheManager,
      CacheKey.PERMIT_APPROVAL_SOURCE,
      createCacheMap(permitApprovalSource, 'id', 'code'),
    );

    const endDateTime = new Date();
    const processingTime = endDateTime.getTime() - startDateTime.getTime();
    this.logger.log(
      `initializeCache() -> Start time: ${startDateTime.toISOString()},` +
        `End time: ${endDateTime.toISOString()},` +
        `Processing time: ${processingTime}ms`,
    );
  }

  private convertFiletoString(svgFilePath: string, encode?: string) {
    const file = fs.readFileSync(svgFilePath, 'utf-8');
    if (encode) {
      return Buffer.from(file).toString('base64');
    } else {
      return Buffer.from(file).toString();
    }
  }
}
