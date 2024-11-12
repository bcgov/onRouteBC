import { Cache } from 'cache-manager';
import { CacheKey } from '../enum/cache-key.enum';
import { getFromCache } from './cache.helper';
import { FeatureFlagValue } from '../enum/feature-flag-value.enum';
import { IDP } from '../enum/idp.enum';

/**
 * Evaluates the given predicate and returns the value if the predicate is true or the value is not null, otherwise returns undefined.
 *
 * @param {T} value - The value to be returned if the predicate evaluates to true or the value is not null.
 * @param {() => boolean} [predicate] - An optional function that returns a boolean indicating whether the value should be substituted.
 * @returns {T | undefined} - The value if predicate evaluates to true or the value is not null, otherwise undefined.
 */
export const undefinedSubstitution = <T>(
  value: T,
  predicate?: () => boolean,
): T | undefined => {
  let result: T | undefined;

  if (predicate) {
    result = predicate() ? value : undefined;
  } else {
    result = value ?? undefined;
  }

  return result;
};

/**
 * Determines if a feature is enabled by checking the value of a feature flag in the cache.
 *
 * @param {Cache} cacheManager - The cache manager to retrieve the feature flag value.
 * @param {string} featureFlag - The feature flag to be evaluated.
 * @returns {Promise<boolean>} - A promise that resolves to true if the feature flag is enabled, otherwise false.
 */
export const isFeatureEnabled = async (
  cacheManager: Cache,
  featureFlag: string,
): Promise<boolean> => {
  const featureFlagValue = (await getFromCache(
    cacheManager,
    CacheKey.FEATURE_FLAG_TYPE,
    featureFlag,
  )) as FeatureFlagValue;

  if (featureFlagValue !== FeatureFlagValue.ENABLED) {
    return false;
  }

  return true;
};

export const isCVClient = (identityProvider: IDP): boolean => {
  return (
    identityProvider !== IDP.IDIR && identityProvider !== IDP.SERVICE_ACCOUNT
  );
};
