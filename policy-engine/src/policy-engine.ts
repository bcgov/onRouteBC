import {
  PolicyDefinition,
  PermitType,
  Commodity,
  VehicleType,
  SizeDimension,
  RegionSizeOverride,
  TrailerSize,
} from 'onroute-policy-engine/types';
import {
  extractIdentifiedObjects,
  intersectIdMaps,
} from './helper/lists.helper';
import { Engine, EngineResult } from 'json-rules-engine';
import { getRulesEngines } from './helper/rules-engine.helper';
import { ValidationResults } from './validation-results';
import { ValidationResult } from './validation-result';
import { addRuntimeFacts } from './helper/facts.helper';
import {
  AccessoryVehicleType,
  ValidationResultType,
  ValidationResultCode,
  RelativePosition,
  VehicleTypes,
} from 'onroute-policy-engine/enum';

/** Class representing commercial vehicle policy. */
export class Policy {
  /** Object representation of policy definition and rules. */
  policyDefinition: PolicyDefinition;

  /**
   * Map of json-rules-engine instances, one for each
   * permit type defined in the permit definition. Keyed
   * on permit type id.
   */
  rulesEngines: Map<string, Engine>;

  /**
   * Creates a new Policy object.
   * @param definition Policy definition to validate permits against
   */
  constructor(definition: PolicyDefinition) {
    this.policyDefinition = definition;

    this.rulesEngines = getRulesEngines(this);
  }

  /**
   * Validates a permit application against the policy definition.
   * @param permit The permit application to validate against policy
   * @returns Results of the validation of the permit application
   */
  async validate(permit: any): Promise<ValidationResults> {
    const engine = this.rulesEngines.get(permit.permitType);
    if (!engine) {
      // If the permit type being validated has no configuration in the
      // policy definition, there will be no engine for it. Return with
      // a single violation result.
      const validationResult: ValidationResults = new ValidationResults();
      validationResult.violations.push(
        new ValidationResult(
          ValidationResultType.Violation,
          ValidationResultCode.PermitTypeUnknown,
          `Permit type ${permit.permitType} unknown`,
        ),
      );
      return validationResult;
    } else {
      // Add facts specific to this run of the validation (e.g. validation
      // date for comparison against start date of the permit).
      addRuntimeFacts(engine, this);

      // Run the json-rules-engine against the permit facts
      const engineResult: EngineResult = await engine.run(permit);

      // Wrap the json-rules-engine result in a ValidationResult object
      return new ValidationResults(engineResult);
    }
  }

  /**
   * Gets a list of all configured permit types in the policy definition.
   * @returns Map of permit type IDs to permit type names.
   */
  getPermitTypes(): Map<string, string> {
    const permitTypes = extractIdentifiedObjects(
      this.policyDefinition.permitTypes,
    );
    return permitTypes;
  }

  /**
   * Gets a list of all configured geographic regions in the policy definition.
   * @returns Map of geographic region IDs to region names.
   */
  getGeographicRegions(): Map<string, string> {
    const geographicRegions = extractIdentifiedObjects(
      this.policyDefinition.geographicRegions,
    );
    return geographicRegions;
  }

  /**
   * Gets a list of all configured commodities in the policy definition.
   * @param permitTypeId Return only commodities valid for this permit type.
   *   If not supplied, return all commodities configured in policy. If permit
   *   type does not require commodity (e.g. 'TROS'), return empty map.
   * @returns Map of commodity IDs to commodity names.
   */
  getCommodities(permitTypeId?: string): Map<string, string> {
    const permitType = this.getPermitTypeDefinition(permitTypeId);
    if (!permitTypeId) {
      // Permit type not supplied, return all commodities
      return extractIdentifiedObjects(this.policyDefinition.commodities);
    } else if (!permitType) {
      // Permit type invalid, throw error
      throw new Error(`Invalid permit type supplied: '${permitTypeId}'`);
    } else if (!permitType.commodityRequired) {
      return new Map<string, string>();
    } else {
      // Commodities for oversize permits are those which have at least one
      // power unit defined in the size dimension object of the commodity.
      const commoditiesForOS = extractIdentifiedObjects(
        this.policyDefinition.commodities.filter((c) => {
          if (c.size) {
            if (c.size.powerUnits) {
              if (c.size.powerUnits.length > 0) {
                return true;
              }
            }
          }
          return false;
        }),
        permitType.allowedCommodities,
      );

      // TODO when implementing overweight. Stub for now.
      const commoditiesForOW: Map<string, string> = new Map<string, string>();

      if (
        permitType.sizeDimensionRequired &&
        permitType.weightDimensionRequired
      ) {
        return intersectIdMaps(commoditiesForOS, commoditiesForOW);
      } else if (permitType.sizeDimensionRequired) {
        return commoditiesForOS;
      } else if (permitType.weightDimensionRequired) {
        return commoditiesForOW;
      } else {
        // This permit type requires commodity selection, but does not
        // require size or weight dimensions. For these permit types, the
        // allowedCommodities must be configured in policy. Return these.
        const commodities = extractIdentifiedObjects(
          this.policyDefinition.commodities,
          permitType.allowedCommodities,
        );
        return commodities;
      }
    }
  }

  /**
   * Gets a list of all allowable vehicle types for the given permit type
   * and commodity. Includes all power units and trailers.
   * @param permitTypeId ID of the permit type to get vehicles for
   * @param commodityId ID of the commodity to get vehicles for
   * @returns Map of two separate maps, one keyed on 'powerUnits' and the
   * other keyed on 'trailers'. Each map consists of a string id for the
   * vehicle, and a string common name for the vehicle.
   */
  getPermittableVehicleTypes(
    permitTypeId: string,
    commodityId: string,
  ): Map<string, Map<string, string>> {
    if (!permitTypeId || !commodityId) {
      throw new Error('Missing permitTypeId and/or commodityId');
    }

    const permitType = this.getPermitTypeDefinition(permitTypeId);
    if (!permitType) {
      throw new Error(`Invalid permit type: '${permitTypeId}'`);
    }

    if (!permitType.commodityRequired) {
      // If commodity is not required, this method cannot calculate the
      // permittable vehicle types since they will not be configured.
      throw new Error(
        `Permit type '${permitTypeId}' does not require a commodity`,
      );
    }

    let puTypes: Map<string, string>;
    let trTypes: Map<string, string>;
    const allowableCommodities = this.getCommodities(permitTypeId);

    if (!allowableCommodities.has(commodityId)) {
      // If the commodity is not allowed for the permit type, no power
      // units or trailers are allowed.
      puTypes = new Map<string, string>();
      trTypes = new Map<string, string>();
    } else {
      const commodity = this.getCommodityDefinition(commodityId);
      if (!commodity) {
        throw new Error(
          `Commodity id '${commodityId}' is not correctly configured in the policy definition`,
        );
      }

      const puTypeIdsOS: Array<string> | undefined =
        commodity.size?.powerUnits?.map((p) => p.type);
      const trTypeIdsOS: Array<string> | undefined = [];
      commodity.size?.powerUnits?.forEach((pu) => {
        const trForPu = pu.trailers.map((t) => t.type);
        if (trForPu) trTypeIdsOS.concat(trForPu);
      });
      // TODO: implement along with overweight permits. Stub for now.
      const puTypeIdsOW: Array<string> = [];
      const trTypeIdsOW: Array<string> = [];

      const puTypesOS = extractIdentifiedObjects(
        this.policyDefinition.vehicleTypes.powerUnitTypes,
        puTypeIdsOS,
      );
      const trTypesOS = extractIdentifiedObjects(
        this.policyDefinition.vehicleTypes.trailerTypes,
        trTypeIdsOS,
      );
      const puTypesOW = extractIdentifiedObjects(
        this.policyDefinition.vehicleTypes.powerUnitTypes,
        puTypeIdsOW,
      );
      const trTypesOW = extractIdentifiedObjects(
        this.policyDefinition.vehicleTypes.trailerTypes,
        trTypeIdsOW,
      );

      if (
        permitType.sizeDimensionRequired &&
        permitType.weightDimensionRequired
      ) {
        puTypes = intersectIdMaps(puTypesOS, puTypesOW);
        trTypes = intersectIdMaps(trTypesOS, trTypesOW);
      } else if (permitType.sizeDimensionRequired) {
        puTypes = puTypesOS;
        trTypes = trTypesOS;
      } else if (permitType.weightDimensionRequired) {
        puTypes = puTypesOW;
        trTypes = trTypesOW;
      } else {
        // This permit type requires commodity selection, but does not
        // require size or weight dimensions. For these permit types, the
        // allowedVehicles must be configured in policy. Return all power
        // units and trailers from this list.
        puTypes = extractIdentifiedObjects(
          this.policyDefinition.vehicleTypes.powerUnitTypes,
          permitType.allowedVehicles,
        );
        trTypes = extractIdentifiedObjects(
          this.policyDefinition.vehicleTypes.trailerTypes,
          permitType.allowedVehicles,
        );
      }
    }

    const vehicleTypes = new Map<string, Map<string, string>>();
    vehicleTypes.set(VehicleTypes.PowerUnits, puTypes);
    vehicleTypes.set(VehicleTypes.Trailers, trTypes);

    return vehicleTypes;
  }

  /**
   * Gets a list of all allowable power unit types for the given permit type
   * and commodity.
   * @param permitTypeId ID of the permit type to get power units for
   * @param commodityId ID of the commodity to get power units for
   * @returns Map of power unit IDs to power unit names.
   */
  getPermittablePowerUnitTypes(
    permitTypeId: string,
    commodityId: string,
  ): Map<string, string> {
    const vehicleTypes = this.getPermittableVehicleTypes(
      permitTypeId,
      commodityId,
    );
    const puTypes = vehicleTypes.get(VehicleTypes.PowerUnits);
    return puTypes ?? new Map<string, string>();
  }

  /**
   * Gets the next permittable vehicles based on the supplied permit type,
   * commodity, and current configuration.
   * If the permit type does not require commodity or if the commodity
   * is not valid for the permit type, this will return an empty map
   * (meaning no vehicles are permittable).
   * @param permitTypeId ID of the permit type to get vehicles for
   * @param commodityId ID of the commodity to get vehicles for
   * @param currentConfiguration Current vehicle configuration to which will be
   * added the next permittable vehicle
   * @returns Map of vehicle ID to vehicle name. Includes both power units and
   * trailers in a single return value (if applicable).
   */
  getNextPermittableVehicles(
    permitTypeId: string,
    commodityId: string,
    currentConfiguration: Array<string>,
  ): Map<string, string> {
    if (!permitTypeId || !commodityId || !currentConfiguration) {
      throw new Error(
        'Missing permitTypeId and/or commodityId and/or currentConfiguration',
      );
    }

    const permitType = this.getPermitTypeDefinition(permitTypeId);
    if (!permitType) {
      throw new Error(`Invalid permit type: '${permitTypeId}'`);
    }

    if (!permitType.commodityRequired) {
      // If commodity is not required, this method cannot calculate the
      // permittable vehicle types since they will not be configured.
      throw new Error(
        `Permit type '${permitTypeId}' does not require a commodity`,
      );
    }

    const commodity = this.getCommodityDefinition(commodityId);
    if (!commodity) {
      throw new Error(`Invalid commodity type: '${commodityId}'`);
    }

    if (
      !this.isConfigurationValid(
        permitTypeId,
        commodityId,
        currentConfiguration,
        true,
      )
    ) {
      // Invalid configuration, no vehicles permitted
      return new Map<string, string>();
    }

    let vehicleTypes = new Map<string, string>();
    let vehicleTypeIds: Array<string> | undefined;
    const allVehicles: Array<VehicleType> =
      this.policyDefinition.vehicleTypes.powerUnitTypes.concat(
        this.policyDefinition.vehicleTypes.trailerTypes,
      );

    if (currentConfiguration.length == 0) {
      // The current configuration is empty, so return only the
      // allowable power units.
      vehicleTypeIds = commodity.size?.powerUnits?.map((p) => p.type);
    } else {
      const powerUnit = commodity.size?.powerUnits?.find(
        (p) => p.type == currentConfiguration[0],
      );
      const trailerIds = powerUnit?.trailers.map((t) => t.type);
      if (currentConfiguration.length == 1) {
        // Just a power unit, return the list of trailerIds for the
        // power unit, plus jeep if any of the trailer Ids allow
        // a jeep.
        if (
          powerUnit?.trailers &&
          powerUnit?.trailers.filter((t) => t.jeep).length > 0
        ) {
          trailerIds?.push(AccessoryVehicleType.Jeep);
        }
        vehicleTypeIds = trailerIds;
      } else {
        const lastVehicleId =
          currentConfiguration[currentConfiguration.length - 1];
        switch (lastVehicleId) {
          case AccessoryVehicleType.Jeep:
            // If there is one jeep, there can be more
            trailerIds?.push(AccessoryVehicleType.Jeep);
            vehicleTypeIds = trailerIds;
            break;
          case AccessoryVehicleType.Booster:
            // If there is one booster, there can be more
            vehicleTypeIds = [AccessoryVehicleType.Booster];
            break;
          default:
            {
              const trailer = powerUnit?.trailers.find(
                (t) => t.type == lastVehicleId,
              );
              if (trailer && trailer.booster) {
                vehicleTypeIds = [AccessoryVehicleType.Booster];
              } else {
                vehicleTypeIds = new Array<string>();
              }
            }
            break;
        }
      }
    }

    vehicleTypes = extractIdentifiedObjects(allVehicles, vehicleTypeIds);

    return vehicleTypes;
  }

  /**
   * Returns whether the supplied configuration is valid for the given permit type
   * and commodity. If the permit type does not require a commodity, this method
   * will return false. This will not validate incomplete configurations - if the
   * current configuration has only a power unit this will return false even if the
   * power unit is acceptable because there is no trailer which is mandatory.
   * If this is called for a permit type that does not require commodity, or with
   * a commodity not permitted for the permit type, it will return false.
   * @param permitTypeId ID of the permit type to validate the configuration against
   * @param commodityId ID of the commodity used for the configuration
   * @param currentConfiguration Current vehicle configuration to validate
   * @param validatePartial Whether to validate a partial configuration (e.g. one
   * that does not include a trailer). This will just return whether or not there
   * are any invalid vehicles in the configuration. If true, an empty current
   * configuration will return true from this method.
   */
  isConfigurationValid(
    permitTypeId: string,
    commodityId: string,
    currentConfiguration: Array<string>,
    validatePartial: boolean = false,
  ): boolean {
    if (!permitTypeId || !commodityId || !currentConfiguration) {
      throw new Error(
        'Missing permitTypeId and/or commodityId and/or currentConfiguration',
      );
    }

    const permitType = this.getPermitTypeDefinition(permitTypeId);
    if (!permitType) {
      throw new Error(`Invalid permit type: '${permitTypeId}'`);
    }

    if (!permitType.commodityRequired) {
      // If commodity is not required, this method cannot calculate the
      // permittable vehicle types since they will not be configured.
      throw new Error(
        `Permit type '${permitTypeId}' does not require a commodity`,
      );
    }

    const commodity = this.getCommodityDefinition(commodityId);
    if (!commodity) {
      throw new Error(`Invalid commodity type: '${commodityId}'`);
    }

    if (currentConfiguration.length == 0) {
      // The current configuration is empty. Fine for partial, but
      // invalid as a complete configuration.
      return validatePartial;
    }

    const powerUnit = commodity.size?.powerUnits?.find(
      (p) => p.type == currentConfiguration[0],
    );
    if (!powerUnit) {
      // The power unit is not allowed for the commodity
      return false;
    }

    let trailerIds = powerUnit.trailers.map((t) => t.type);
    let jeepAllowed: boolean = true;
    let trailerAllowed: boolean = true;
    let boosterAllowed: boolean = false;

    for (let i = 1; i < currentConfiguration.length; i++) {
      switch (currentConfiguration[i]) {
        case AccessoryVehicleType.Jeep:
          if (!jeepAllowed) {
            return false;
          }
          // Filter allowed trailers to only those that allow jeeps
          trailerIds = powerUnit.trailers
            .filter((t) => t.jeep)
            .map((t) => t.type);
          break;
        case AccessoryVehicleType.Booster:
          if (!boosterAllowed) {
            return false;
          }
          break;
        default:
          if (!trailerAllowed) {
            return false;
          }
          {
            const trailer = powerUnit.trailers.find(
              (t) => t.type == currentConfiguration[i],
            );
            if (!trailer || !trailerIds.includes(currentConfiguration[i])) {
              // This trailer is not permitted for this power unit
              return false;
            }
            jeepAllowed = false;
            trailerAllowed = false;
            boosterAllowed = trailer.booster;
          }
          break;
      }
    }
    // We are still here, so configuration is valid. If there is a trailer
    // it is a valid final configuration, otherwise it is a valid partial
    // configuration.
    return !trailerAllowed || validatePartial;
  }

  /**
   * Gets the maximum size dimensions for a given permit type, commodity,
   * and vehicle configuration. A vehicle configuration's size dimension is
   * dictated by the configuration on the trailer. For configurations that
   * are just a power unit, a pseudo trailer type 'NONE' is used and the
   * size dimension is configured on that. Accessory category trailers
   * (e.g. jeeps and boosters) are not used for configuration since they
   * do not impact the size dimension in policy.
   * @param permitTypeId ID of the permit type to get size dimension for
   * @param commodityId ID of the commodity to get size dimension for
   * @param currentConfiguration Current vehicle configuration to get size dimension for
   * @param regions List of regions the vehicle will be traveling in. If not
   * supplied this defaults to the most restrictive size dimension (if multiple
   * are configured).
   * @returns SizeDimension for the given permit type, commodity, and configuration
   */
  getSizeDimension(
    permitTypeId: string,
    commodityId: string,
    configuration: Array<string>,
    regions?: Array<string>,
  ): SizeDimension | null {
    // Initialize the sizeDimension with global defaults
    let sizeDimension: SizeDimension | null = null;

    // Validate that the configuration is permittable
    if (this.isConfigurationValid(permitTypeId, commodityId, configuration)) {
      // Get the power unit that has the size configuration
      const commodity = this.getCommodityDefinition(commodityId);
      const powerUnit = commodity?.size?.powerUnits?.find(
        (pu) => pu.type == configuration[0],
      );
      if (!powerUnit) {
        throw new Error(
          `Configuration error: could not find power unit '${configuration[0]}'`,
        );
      }

      // Get the last trailer in the configuration that can be used for size calculations
      const sizeTrailer: string | undefined = Array.from(configuration)
        .reverse()
        .find((vehicleId) => {
          const trailerType =
            this.policyDefinition.vehicleTypes.trailerTypes?.find(
              (v) => v.id == vehicleId,
            );
          return !trailerType?.ignoreForSizeDimensions;
        });

      if (sizeTrailer) {
        // Get the trailer size dimension array for the commodity
        const trailer: TrailerSize | undefined = powerUnit.trailers?.find(
          (t) => t.type == sizeTrailer,
        );

        let sizeDimensions: Array<SizeDimension>;

        if (
          trailer &&
          trailer.sizeDimensions &&
          trailer.sizeDimensions.length > 0
        ) {
          sizeDimensions = trailer.sizeDimensions;
        } else {
          sizeDimensions = new Array<SizeDimension>();
        }

        const sizeDimensionConfigured = this.selectCorrectSizeDimension(
          sizeDimensions,
          configuration,
          sizeTrailer,
        );

        if (sizeDimensionConfigured) {
          // Adjust the size dimensions for the regions travelled, if needed
          if (!regions) {
            // If we are not provided a list of regions, assume we are
            // traveling through all regions (will take the most restrictive
            // of all dimensions in all cases).
            console.log('Assuming all regions for size dimension lookup');
            regions = this.policyDefinition.geographicRegions.map((g) => g.id);
          } else {
            console.log(`Using '${regions}' as regions for size lookup`);
          }
          const valueOverrides: Array<RegionSizeOverride> = [];
          regions?.forEach((r) => {
            let valueOverride: RegionSizeOverride;
            // Check to see if this region has specific size dimensions
            const regionOverride = sizeDimensionConfigured.regions?.find(
              (cr) => cr.region == r,
            );
            if (!regionOverride) {
              // The region travelled does not have an override, so it assumes
              // the dimensions of the bc default.
              valueOverride = {
                region: r,
                h: sizeDimensionConfigured.h,
                w: sizeDimensionConfigured.w,
                l: sizeDimensionConfigured.l,
              };
            } else {
              // There is a region override with one or more dimensions. Use this
              // value preferentially, using default dimension if not supplied
              valueOverride = {
                region: r,
                h: regionOverride.h ?? sizeDimensionConfigured.h,
                w: regionOverride.w ?? sizeDimensionConfigured.w,
                l: regionOverride.l ?? sizeDimensionConfigured.l,
              };
            }
            valueOverrides.push(valueOverride);
          });

          // At this point we have a complete set of size dimensions for each of
          // the regions that will be traversed. Take the minimum value of each
          // dimension for the final value.
          const minimumOverrides = valueOverrides.reduce(
            (accumulator, currentValue) => {
              if (typeof currentValue.h !== 'undefined') {
                if (typeof accumulator.h === 'undefined') {
                  accumulator.h = currentValue.h;
                } else {
                  accumulator.h = Math.min(accumulator.h, currentValue.h);
                }
              }
              if (typeof currentValue.w !== 'undefined') {
                if (typeof accumulator.w === 'undefined') {
                  accumulator.w = currentValue.w;
                } else {
                  accumulator.w = Math.min(accumulator.w, currentValue.w);
                }
              }
              if (typeof currentValue.l !== 'undefined') {
                if (typeof accumulator.l === 'undefined') {
                  accumulator.l = currentValue.l;
                } else {
                  accumulator.l = Math.min(accumulator.l, currentValue.l);
                }
              }
              return accumulator;
            },
            { region: '' },
          );

          sizeDimension = {
            rp: sizeDimensionConfigured.rp,
            fp: sizeDimensionConfigured.fp,
            h: minimumOverrides.h,
            w: minimumOverrides.w,
            l: minimumOverrides.l,
          };
        } else {
          console.log('Size dimension not configured for trailer');
        }
      } else {
        console.log('Could not locate trailer to use for size dimension');
      }
    } else {
      console.log('Configuration is invalid, returning null size dimension');
    }

    return sizeDimension;
  }

  /**
   * Selects the correct size dimension from a list of potential candidates, based
   * on the modifier of each dimension. If none of the modifiers match, returns
   * null.
   * @param sizeDimensions Size dimension options to choose from
   * @param currentConfiguration The full vehicle configuration
   */
  selectCorrectSizeDimension(
    sizeDimensions: Array<SizeDimension>,
    configuration: Array<string>,
    sizeTrailer: string,
  ): SizeDimension | null {
    let matchingDimension: SizeDimension | null = null;

    if (sizeDimensions?.length > 0 && configuration?.length > 0) {
      for (const sizeDimension of sizeDimensions) {
        if (!sizeDimension.modifiers) {
          // This dimension has no modifiers, so it is the default if none of
          // the other specific modifiers match.
          matchingDimension = sizeDimension;
          console.log('Using default size dimension, no modifiers specified');
        } else {
          const sizeTrailerIndex = configuration.findIndex(
            (c) => sizeTrailer == c,
          );
          const isMatch: boolean | undefined = sizeDimension.modifiers?.every(
            (m) => {
              if (!m.type) {
                return false;
              }
              switch (m.position) {
                case RelativePosition.First.toString():
                  return configuration[0] == m.type;
                case RelativePosition.Last.toString():
                  return configuration[configuration.length - 1] == m.type;
                case RelativePosition.Before.toString():
                  return configuration[sizeTrailerIndex - 1] == m.type;
                case RelativePosition.After.toString():
                  return configuration[sizeTrailerIndex + 1] == m.type;
                default:
                  return false;
              }
            },
          );
          // As soon as we find a dimension with matching modifiers,
          // set it and return it.
          if (isMatch) {
            matchingDimension = sizeDimension;
            break;
          }
        }
      }
    } else {
      console.log(
        'Either size dimensions or configuration array is null, no matching dimension returned',
      );
    }
    return matchingDimension;
  }

  /**
   * Gets a list of all configured power unit types in the policy definition.
   * @returns Map of power unit type IDs to power unit type names.
   */
  getPowerUnitTypes(): Map<string, string> {
    const powerUnitTypes = extractIdentifiedObjects(
      this.policyDefinition.vehicleTypes.powerUnitTypes,
    );
    return powerUnitTypes;
  }

  /**
   * Gets a list of all configured trailer types in the policy definition.
   * @returns Map of trailer type IDs to trailer type names.
   */
  getTrailerTypes(): Map<string, string> {
    const trailerTypes = extractIdentifiedObjects(
      this.policyDefinition.vehicleTypes.trailerTypes,
    );
    return trailerTypes;
  }

  /**
   * Gets a full PermitType definition by ID.
   * @param type Type ID of the permit definition to return.
   * @returns PermitType definition for the supplied ID.
   */
  getPermitTypeDefinition(type?: string): PermitType | null {
    let permitType: PermitType | undefined;
    if (this.policyDefinition.permitTypes) {
      permitType = this.policyDefinition.permitTypes.find((p) => p.id === type);
    }

    if (permitType) {
      return permitType;
    } else {
      return null;
    }
  }

  /**
   * Gets a full Commodity definition by ID
   * @param type Type ID of the commodity to return.
   * @returns Commodity definition for the supplied ID.
   */
  getCommodityDefinition(type?: string): Commodity | null {
    let commodity: Commodity | undefined;
    if (this.policyDefinition.commodities) {
      commodity = this.policyDefinition.commodities.find((c) => c.id === type);
    }

    if (commodity) {
      return commodity;
    } else {
      return null;
    }
  }
}
