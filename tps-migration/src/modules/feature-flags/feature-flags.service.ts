import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadFeatureFlagDto } from './dto/response/read-feature-flag.dto';
import { FeatureFlag } from './entities/feature-flag.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LogAsyncMethodExecution } from 'src/decorator/log-async-method-execution.decorator';
import { CacheKey } from 'src/enum/cache-key.enum';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @InjectRepository(FeatureFlag)
    private featureFlagRepository: Repository<FeatureFlag>,
    @InjectMapper() private readonly classMapper: Mapper,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * The findAll() method returns an array of ReadFeatureFlagDto objects.
   * It retrieves the entities from the database using the Repository,
   * maps it to a DTO object using the Mapper, and returns it.
   *
   * @returns The feature flag list as a promise of type {@link ReadFeatureFlagDto}
   */
  @LogAsyncMethodExecution()
  async findAll(): Promise<ReadFeatureFlagDto[]> {
    return this.classMapper.mapArrayAsync(
      await this.featureFlagRepository.find(),
      FeatureFlag,
      ReadFeatureFlagDto,
    );
  }

  /**
   * The findAllFromCache() method returns a Map of the feature flags that
   * were stored in the NestJS system cache upon startup.
   *
   * @returns The feature flag list as a promise of type Map<string, string>
   */
  @LogAsyncMethodExecution()
  async findAllFromCache(): Promise<Map<string, string>> {
    return await this.cacheManager.get(CacheKey.FEATURE_FLAG_TYPE);
  }
}
