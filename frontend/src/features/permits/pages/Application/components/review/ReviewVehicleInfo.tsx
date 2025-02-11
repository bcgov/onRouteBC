import { Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";

import "./ReviewVehicleInfo.scss";
import { DiffChip } from "./DiffChip";
import { areValuesDifferent } from "../../../../../../common/helpers/equality";
import { Nullable } from "../../../../../../common/types/common";
import { VEHICLE_TYPES, VehicleType } from "../../../../../manageVehicles/types/Vehicle";
import { getDefaultRequiredVal } from "../../../../../../common/helpers/util";
import { DEFAULT_VEHICLE_TYPE, PermitVehicleDetails } from "../../../../types/PermitVehicleDetails";
import { getCountryFullName } from "../../../../../../common/helpers/countries/getCountryFullName";
import { getProvinceFullName } from "../../../../../../common/helpers/countries/getProvinceFullName";
import { PERMIT_TYPES, PermitType } from "../../../../types/PermitType";
import { PowerUnitInfoDisplay } from "../common/PowerUnitInfoDisplay";
import { SelectedVehicleSubtypeList } from "../common/SelectedVehicleSubtypeList";
import { useMemoizedArray } from "../../../../../../common/hooks/useMemoizedArray";
import { VehicleInConfiguration } from "../../../../types/PermitVehicleConfiguration";
import {
  getSubtypeNameByCode,
  vehicleTypeDisplayText,
} from "../../../../helpers/mappers";

export const ReviewVehicleInfo = ({
  permitType,
  vehicleDetails,
  vehicleWasSaved,
  powerUnitSubtypeNamesMap,
  trailerSubtypeNamesMap,
  showChangedFields = false,
  oldFields,
  selectedVehicleConfigSubtypes,
}: {
  permitType?: Nullable<PermitType>;
  vehicleDetails?: Nullable<PermitVehicleDetails>;
  vehicleWasSaved?: Nullable<boolean>;
  powerUnitSubtypeNamesMap: Map<string, string>;
  trailerSubtypeNamesMap: Map<string, string>;
  showChangedFields?: boolean;
  oldFields?: Nullable<PermitVehicleDetails>;
  selectedVehicleConfigSubtypes?: Nullable<VehicleInConfiguration[]>;
}) => {
  const vehicleType = getDefaultRequiredVal(
    DEFAULT_VEHICLE_TYPE,
    vehicleDetails?.vehicleType,
  ) as VehicleType;

  const vehicleSubtype = getSubtypeNameByCode(
    powerUnitSubtypeNamesMap,
    trailerSubtypeNamesMap,
    vehicleType,
    getDefaultRequiredVal("", vehicleDetails?.vehicleSubType),
  );

  const showLicensedGVW = Boolean(permitType)
    && ([
      PERMIT_TYPES.STOS,
      PERMIT_TYPES.MFP,
    ] as PermitType[]).includes(permitType as PermitType)
    && vehicleType === VEHICLE_TYPES.POWER_UNIT;

  const changedFields = showChangedFields
    ? {
        unit: areValuesDifferent(
          vehicleDetails?.unitNumber,
          oldFields?.unitNumber,
        ),
        vin: areValuesDifferent(vehicleDetails?.vin, oldFields?.vin),
        plate: areValuesDifferent(vehicleDetails?.plate, oldFields?.plate),
        make: areValuesDifferent(vehicleDetails?.make, oldFields?.make),
        year: areValuesDifferent(vehicleDetails?.year, oldFields?.year),
        country: areValuesDifferent(
          vehicleDetails?.countryCode,
          oldFields?.countryCode,
        ),
        province: areValuesDifferent(
          vehicleDetails?.provinceCode,
          oldFields?.provinceCode,
        ),
        type: areValuesDifferent(
          vehicleDetails?.vehicleType,
          oldFields?.vehicleType,
        ),
        subtype: areValuesDifferent(
          vehicleDetails?.vehicleSubType,
          oldFields?.vehicleSubType,
        ),
        licensedGVW: areValuesDifferent(
          vehicleDetails?.licensedGVW,
          oldFields?.licensedGVW,
        ),
      }
    : {
        unit: false,
        vin: false,
        plate: false,
        make: false,
        year: false,
        country: false,
        province: false,
        type: false,
        subtype: false,
        licensedGVW: false,
      };

  const provinceDisplay = getProvinceFullName(
    vehicleDetails?.countryCode,
    vehicleDetails?.provinceCode,
  );

  const selectedSubtypesDisplay = useMemoizedArray(
    getDefaultRequiredVal(
      [],
      selectedVehicleConfigSubtypes,
    ).map(({ vehicleSubType }) => {
      if (vehicleSubType === "NONEXXX") return "None";
      return getDefaultRequiredVal(
        vehicleSubType,
        trailerSubtypeNamesMap.get(vehicleSubType),
        powerUnitSubtypeNamesMap.get(vehicleSubType),
      );
    }),
    (selectedSubtype) => selectedSubtype,
    (subtype1, subtype2) => subtype1 === subtype2,
  );

  const showDiffChip = (show: boolean) => {
    return show ? <DiffChip /> : null;
  };

  return (
    <Box className="review-vehicle-info">
      <Box className="review-vehicle-info__header">
        <Typography variant={"h3"}>Vehicle Information</Typography>
      </Box>

      <Box className="review-vehicle-info__body">
        {permitType !== PERMIT_TYPES.STOS ? (
          <Box className="info-section">
            <div className="info-section__info info-section__info--unit">
              <Typography className="info-section__label">
                <span className="info-section__label-text">Unit #</span>
                {showDiffChip(changedFields.unit)}
              </Typography>

              <Typography
                className="info-section__data"
                data-testid="review-vehicle-unit-number"
              >
                {vehicleDetails?.unitNumber}
              </Typography>
            </div>

            <div className="info-section__info">
              <Typography className="info-section__label">
                VIN{" "}
                <span className="info-section__label--indicator">
                  (last 6 digits)
                </span>
                {showDiffChip(changedFields.vin)}
              </Typography>

              <Typography
                className="info-section__data"
                data-testid="review-vehicle-vin"
              >
                {vehicleDetails?.vin}
              </Typography>
            </div>

            <div className="info-section__info">
              <Typography className="info-section__label">
                <span className="info-section__label-text">Plate</span>
                {showDiffChip(changedFields.plate)}
              </Typography>

              <Typography
                className="info-section__data"
                data-testid="review-vehicle-plate"
              >
                {vehicleDetails?.plate}
              </Typography>
            </div>

            <div className="info-section__info">
              <Typography className="info-section__label">
                <span className="info-section__label-text">Make</span>
                {showDiffChip(changedFields.make)}
              </Typography>

              <Typography
                className="info-section__data"
                data-testid="review-vehicle-make"
              >
                {vehicleDetails?.make}
              </Typography>
            </div>

            <div className="info-section__info">
              <Typography className="info-section__label">
                <span className="info-section__label-text">Year</span>
                {showDiffChip(changedFields.year)}
              </Typography>

              <Typography
                className="info-section__data"
                data-testid="review-vehicle-year"
              >
                {vehicleDetails?.year}
              </Typography>
            </div>

            <div className="info-section__info">
              <Typography className="info-section__label">
                <span className="info-section__label-text">Country</span>
                {showDiffChip(changedFields.country)}
              </Typography>

              <Typography
                className="info-section__data"
                data-testid="review-vehicle-country"
              >
                {getCountryFullName(vehicleDetails?.countryCode)}
              </Typography>
            </div>

            {provinceDisplay ? (
              <div className="info-section__info">
                <Typography className="info-section__label">
                  <span className="info-section__label-text">Province / State</span>
                  {showDiffChip(changedFields.province)}
                </Typography>

                <Typography
                  className="info-section__data"
                  data-testid="review-vehicle-province"
                >
                  {provinceDisplay}
                </Typography>
              </div>
            ) : null}

            <div className="info-section__info">
              <Typography className="info-section__label">
                <span className="info-section__label-text">Vehicle Type</span>
                {showDiffChip(changedFields.type)}
              </Typography>

              <Typography
                className="info-section__data"
                data-testid="review-vehicle-type"
              >
                {vehicleTypeDisplayText(vehicleType)}
              </Typography>
            </div>

            <div className="info-section__info">
              <Typography className="info-section__label">
                <span className="info-section__label-text">Vehicle Sub-type</span>
                {showDiffChip(changedFields.subtype)}
              </Typography>

              <Typography
                className="info-section__data"
                data-testid="review-vehicle-subtype"
              >
                {vehicleSubtype}
              </Typography>
            </div>

            {showLicensedGVW && vehicleDetails?.licensedGVW ? (
              <div className="info-section__info">
                <Typography className="info-section__label">
                  <span className="info-section__label-text">Licensed GVW (kg)</span>
                  {showDiffChip(changedFields.licensedGVW)}
                </Typography>

                <Typography
                  className="info-section__data"
                  data-testid="review-vehicle-gvw"
                >
                  {vehicleDetails.licensedGVW.toLocaleString()}
                </Typography>
              </div>
            ) : null}

            {vehicleWasSaved ? (
              <Typography className="info-section__msg">
                <FontAwesomeIcon className="icon" icon={faCircleCheck} />
                <span data-testid="review-vehicle-saved-msg">
                  This vehicle has been added/updated to your Vehicle Inventory.
                </span>
              </Typography>
            ) : null}
          </Box>
        ) : (
          <Box className="selected-power-unit-and-trailers">
            {vehicleDetails ? (
              <Box className="selected-power-unit">
                <Typography variant="h4">Power Unit</Typography>

                <PowerUnitInfoDisplay
                  powerUnitInfo={vehicleDetails}
                  powerUnitSubtypeNamesMap={powerUnitSubtypeNamesMap}
                />
              </Box>
            ) : null}

            <Box className="selected-trailers">
              <Typography variant="h4">Trailer(s)</Typography>

              <SelectedVehicleSubtypeList
                selectedSubtypesDisplay={selectedSubtypesDisplay}
              />
            </Box>

            {vehicleWasSaved ? (
              <Typography className="vehicle-saved">
                <FontAwesomeIcon className="icon" icon={faCircleCheck} />
                <span data-testid="review-vehicle-saved-msg">
                  This vehicle has been added/updated to your Vehicle Inventory.
                </span>
              </Typography>
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );
};
