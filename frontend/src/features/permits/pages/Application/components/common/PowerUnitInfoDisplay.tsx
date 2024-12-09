import "./PowerUnitInfoDisplay.scss";
import { countrySupportsProvinces } from "../../../../../../common/helpers/countries/countrySupportsProvinces";
import { getCountryFullName } from "../../../../../../common/helpers/countries/getCountryFullName";
import { getProvinceFullName } from "../../../../../../common/helpers/countries/getProvinceFullName";
import { getDefaultRequiredVal } from "../../../../../../common/helpers/util";
import { PermitVehicleDetails } from "../../../../types/PermitVehicleDetails";

export const PowerUnitInfoDisplay = ({
  powerUnitInfo,
  powerUnitSubtypeNamesMap,
}: {
  powerUnitInfo: PermitVehicleDetails;
  powerUnitSubtypeNamesMap: Map<string, string>;
}) => {
  const provinceDisplay = countrySupportsProvinces(powerUnitInfo.countryCode)
    ? getProvinceFullName(powerUnitInfo.countryCode, powerUnitInfo.provinceCode)
    : getCountryFullName(powerUnitInfo.countryCode);
  
  return (
    <div className="power-unit-info-display">
      <div className="power-unit-info-display__data power-unit-info-display__data--unit">
        <div className="power-unit-info-display__label">
          Unit #
        </div>

        <div className="power-unit-info-display__value">
          {powerUnitInfo.unitNumber ? powerUnitInfo.unitNumber : "-"}
        </div>
      </div>

      <div className="power-unit-info-display__data power-unit-info-display__data--vin">
        <div className="power-unit-info-display__label">
          VIN (last 6 digits)
        </div>

        <div className="power-unit-info-display__value">
          {powerUnitInfo.vin}
        </div>
      </div>

      <div className="power-unit-info-display__data power-unit-info-display__data--plate">
        <div className="power-unit-info-display__label">
          Plate
        </div>

        <div className="power-unit-info-display__value">
          {powerUnitInfo.plate}
        </div>
      </div>

      <div className="power-unit-info-display__data power-unit-info-display__data--make">
        <div className="power-unit-info-display__label">
          Make
        </div>

        <div className="power-unit-info-display__value">
          {powerUnitInfo.make}
        </div>
      </div>

      <div className="power-unit-info-display__data power-unit-info-display__data--year">
        <div className="power-unit-info-display__label">
          Year
        </div>

        <div className="power-unit-info-display__value">
          {powerUnitInfo.year}
        </div>
      </div>

      <div className="power-unit-info-display__data power-unit-info-display__data--province">
        <div className="power-unit-info-display__label">
          Province / State
        </div>

        <div className="power-unit-info-display__value">
          {provinceDisplay}
        </div>
      </div>

      <div className="power-unit-info-display__data power-unit-info-display__data--subtype">
        <div className="power-unit-info-display__label">
          Vehicle Sub-type
        </div>

        <div className="power-unit-info-display__value">
          {powerUnitSubtypeNamesMap.get(powerUnitInfo.vehicleSubType)}
        </div>
      </div>

      <div className="power-unit-info-display__data power-unit-info-display__data--gvw">
        <div className="power-unit-info-display__label">
          Licensed GVW (kg)
        </div>

        <div className="power-unit-info-display__value">
          {getDefaultRequiredVal(0, powerUnitInfo.licensedGVW).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
