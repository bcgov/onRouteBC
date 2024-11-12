import dayjs from 'dayjs';
import { Engine } from 'json-rules-engine';
import { PermitAppInfo, PolicyFacts } from 'onroute-policy-engine/enum';
import { Policy } from '../policy-engine';

/**
 * Adds runtime facts for the validation. For example, adds the
 * validation date for comparison against startDate of the permit.
 * @param engine json-rules-engine Engine instance to add facts to.
 */
export function addRuntimeFacts(engine: Engine, policy: Policy): void {
  const today: string = dayjs().format(PermitAppInfo.PermitDateFormat);
  engine.addFact(PolicyFacts.ValidationDate, today);

  /**
   * Add runtime fact for number of days in the permit year.
   * Will be either 365 or 366, for use when comparing against
   * duration for 1 year permits.
   */
  engine.addFact(
    PolicyFacts.DaysInPermitYear,
    async function (params, almanac) {
      const startDate: string = await almanac.factValue(
        PermitAppInfo.PermitData,
        {},
        PermitAppInfo.PermitStartDate,
      );
      const dateFrom = dayjs(startDate, PermitAppInfo.PermitDateFormat);
      const daysInPermitYear = dateFrom.add(1, 'year').diff(dateFrom, 'day');
      return daysInPermitYear;
    },
  );

  /**
   * Adds a runtime fact specifying whether the vehicle configuration
   * in the permit application is valid for the permit type and
   * commodity. Will return true or false.
   */
  engine.addFact(
    PolicyFacts.ConfigurationIsValid.toString(),
    async function (params, almanac) {
      const powerUnit: string = await almanac.factValue(
        PermitAppInfo.PermitData,
        {},
        PermitAppInfo.PowerUnitType,
      );
      const trailerList: Array<any> = await almanac.factValue(
        PermitAppInfo.PermitData,
        {},
        PermitAppInfo.TrailerList,
      );
      let fullVehicleConfiguration = [];
      fullVehicleConfiguration.push(powerUnit);
      fullVehicleConfiguration = fullVehicleConfiguration.concat(
        trailerList.map((t) => t.vehicleSubType),
      );

      const permitType: string = await almanac.factValue(
        PermitAppInfo.PermitType,
      );
      const commodity: string = await almanac.factValue(
        PermitAppInfo.PermitData,
        {},
        PermitAppInfo.Commodity,
      );
      let isValid: boolean;
      try {
        isValid = policy.isConfigurationValid(
          permitType,
          commodity,
          fullVehicleConfiguration,
        );
      } catch (e) {
        console.log(`Error validating vehicle configuration: '{e.message}'`);
        isValid = false;
      }
      return isValid;
    },
  );

  /**
   * Add runtime fact for a fixed permit cost, the cost supplied
   * as a parameter.
   */
  engine.addFact(PolicyFacts.FixedCost.toString(), async function (params) {
    return params.cost;
  });

  /**
   * Add runtime fact for cost per month, where month is defined by
   * policy as a 30 day period or portion thereof, except in the
   * case of a full year in which case it is 12 months.
   */
  engine.addFact(
    PolicyFacts.CostPerMonth.toString(),
    async function (params, almanac) {
      const duration: number = await almanac.factValue(
        PermitAppInfo.PermitData,
        {},
        PermitAppInfo.PermitDuration,
      );
      const daysInPermitYear: number = await almanac.factValue(
        PolicyFacts.DaysInPermitYear.toString(),
      );

      let months: number = Math.floor(duration / 30);
      const extraDays: number = duration % 30;

      if (extraDays > 0 && duration !== daysInPermitYear) {
        // Add an extra month for a partial month unless it is
        // a full year. Note this does not handle the case where 2
        // or more years duration is specified, since that is not
        // a valid permit and does not warrant considetation.
        months++;
      }

      return months * params.cost;
    },
  );
}
