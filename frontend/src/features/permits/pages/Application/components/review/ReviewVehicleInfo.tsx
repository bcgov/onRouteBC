import { Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";

import "./ReviewVehicleInfo.scss";
import { DiffChip } from "./DiffChip";
import { areValuesDifferent } from "../../../../../../common/helpers/equality";
import { Nullable } from "../../../../../../common/types/common";
import { VehicleType } from "../../../../../manageVehicles/types/Vehicle";
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

  return (
    <Box className="review-vehicle-info">
      <Box className="review-vehicle-info__header">
        <Typography variant={"h3"}>Vehicle Information</Typography>
      </Box>

      <Box className="review-vehicle-info__body">
        {permitType !== PERMIT_TYPES.STOS ? (
          <Box className="info-section">
            <Typography className="info-section__label">
              <span className="info-section__label-text">Unit #</span>
              {changedFields.unit ? <DiffChip /> : null}
            </Typography>

            <Typography
              className="info-section__data"
              data-testid="review-vehicle-unit-number"
            >
              {vehicleDetails?.unitNumber}
            </Typography>

            <Typography className="info-section__label">
              VIN{" "}
              <span className="info-section__label--indicator">
                (last 6 digits)
              </span>
              {changedFields.vin ? <DiffChip /> : null}
            </Typography>

            <Typography
              className="info-section__data"
              data-testid="review-vehicle-vin"
            >
              {vehicleDetails?.vin}
            </Typography>

            <Typography className="info-section__label">
              <span className="info-section__label-text">Plate</span>
              {changedFields.plate ? <DiffChip /> : null}
            </Typography>

            <Typography
              className="info-section__data"
              data-testid="review-vehicle-plate"
            >
              {vehicleDetails?.plate}
            </Typography>

            <Typography className="info-section__label">
              <span className="info-section__label-text">Make</span>
              {changedFields.make ? <DiffChip /> : null}
            </Typography>

            <Typography
              className="info-section__data"
              data-testid="review-vehicle-make"
            >
              {vehicleDetails?.make}
            </Typography>

            <Typography className="info-section__label">
              <span className="info-section__label-text">Year</span>
              {changedFields.year ? <DiffChip /> : null}
            </Typography>

            <Typography
              className="info-section__data"
              data-testid="review-vehicle-year"
            >
              {vehicleDetails?.year}
            </Typography>

            <Typography className="info-section__label">
              <span className="info-section__label-text">Country</span>
              {changedFields.country ? <DiffChip /> : null}
            </Typography>

            <Typography
              className="info-section__data"
              data-testid="review-vehicle-country"
            >
              {getCountryFullName(vehicleDetails?.countryCode)}
            </Typography>

            {provinceDisplay ? (
              <>
                <Typography className="info-section__label">
                  <span className="info-section__label-text">Province / State</span>
                  {changedFields.province ? <DiffChip /> : null}
                </Typography>

                <Typography
                  className="info-section__data"
                  data-testid="review-vehicle-province"
                >
                  {provinceDisplay}
                </Typography>
              </>
            ) : null}

            <Typography className="info-section__label">
              <span className="info-section__label-text">Vehicle Type</span>
              {changedFields.type ? <DiffChip /> : null}
            </Typography>

            <Typography
              className="info-section__data"
              data-testid="review-vehicle-type"
            >
              {vehicleTypeDisplayText(vehicleType)}
            </Typography>

            <Typography className="info-section__label">
              <span className="info-section__label-text">Vehicle Sub-type</span>
              {changedFields.subtype ? <DiffChip /> : null}
            </Typography>

            <Typography
              className="info-section__data"
              data-testid="review-vehicle-subtype"
            >
              {vehicleSubtype}
            </Typography>

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
