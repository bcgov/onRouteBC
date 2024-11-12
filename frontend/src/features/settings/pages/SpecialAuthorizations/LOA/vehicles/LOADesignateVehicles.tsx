import { Controller, useFormContext } from "react-hook-form";
import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import "./LOADesignateVehicles.scss";
import { InfoBcGovBanner } from "../../../../../../common/components/banners/InfoBcGovBanner";
import { BANNER_MESSAGES } from "../../../../../../common/constants/bannerMessages";
import OnRouteBCContext from "../../../../../../common/authentication/OnRouteBCContext";
import { applyWhenNotNullable, getDefaultRequiredVal } from "../../../../../../common/helpers/util";
import { VEHICLE_TYPES } from "../../../../../manageVehicles/types/Vehicle";
import { LOAFormData } from "../../../../types/LOAFormData";
import { LOAVehicle } from "../../../../types/LOAVehicle";
import { VehicleTable } from "../../../../components/SpecialAuthorizations/LOA/vehicles/VehicleTable";
import { LOAVehicleTabLayout } from "../../../../components/SpecialAuthorizations/LOA/vehicles/LOAVehicleTabLayout";
import { LOAVehicleTab, LOA_VEHICLE_TABS } from "../../../../types/LOAVehicleTab";
import { selectionRequired } from "../../../../../../common/helpers/validationMessages";
import { Nullable, Optional } from "../../../../../../common/types/common";
import {
  usePowerUnitSubTypesQuery,  
  usePowerUnitsQuery,
} from "../../../../../manageVehicles/hooks/powerUnits";

import {
  useTrailerSubTypesQuery,
  useTrailersQuery,
} from "../../../../../manageVehicles/hooks/trailers";

const vehicleSelectionRules =  {
  validate: {
    requiredVehicleSelection: (
      value: Optional<{
        powerUnits: Record<string, Nullable<LOAVehicle>>;
        trailers: Record<string, Nullable<LOAVehicle>>;
      }>,
    ) => {
      return (
        applyWhenNotNullable(
          selection =>
            Object.keys(selection.powerUnits).length > 0
            || Object.keys(selection.trailers).length > 0,
          value,
          false,
        ) ||
        selectionRequired()
      );
    },
  },
};

const getVehicleDetailsForSelected = (
  selectedVehicles: string[],
  vehicleSource: LOAVehicle[],
): Record<string, LOAVehicle | null> => {
  const selectedVehicleIds = new Set(selectedVehicles);
  const detailsOfSelectedIds = [...selectedVehicleIds].map(vehicleId => {
    const vehicleDetail = vehicleSource.find(vehicle => vehicle.vehicleId === vehicleId);
    if (!vehicleDetail) return [vehicleId, null];
    return [vehicleId, {
      vehicleId: vehicleDetail.vehicleId,
      unitNumber: vehicleDetail.unitNumber,
      make: vehicleDetail.make,
      vehicleType: vehicleDetail.vehicleType,
      vin: vehicleDetail.vin,
      plate: vehicleDetail.plate,
      vehicleSubType: vehicleDetail.vehicleSubType,
    }];
  });

  return Object.fromEntries(detailsOfSelectedIds);
};

export const LOADesignateVehicles = () => {
  const { companyId: companyIdFromContext } = useContext(OnRouteBCContext);
  const companyId = getDefaultRequiredVal(0, companyIdFromContext);

  const [vehicleTab, setVehicleTab] = useState<LOAVehicleTab>(LOA_VEHICLE_TABS.POWER_UNITS);

  const {
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
    trigger,
  } = useFormContext<LOAFormData>();

  const selectedPowerUnits = watch("selectedVehicles.powerUnits");
  const selectedTrailers = watch("selectedVehicles.trailers");

  const powerUnitsQuery = usePowerUnitsQuery(companyId);
  const trailersQuery = useTrailersQuery(companyId);
  const powerUnitSubTypesQuery = usePowerUnitSubTypesQuery();
  const trailerSubTypesQuery = useTrailerSubTypesQuery();
  const powerUnitSubTypes = useMemo(() => getDefaultRequiredVal(
    [],
    powerUnitSubTypesQuery.data,
  ), [powerUnitSubTypesQuery.data]);

  const trailerSubTypes = useMemo(() => getDefaultRequiredVal(
    [],
    trailerSubTypesQuery.data,
  ), [trailerSubTypesQuery.data]);

  const { data: powerUnitsData } = powerUnitsQuery;
  const { data: trailersData } = trailersQuery;

  const powerUnits = useMemo(() => getDefaultRequiredVal([], powerUnitsData)
    .map((vehicle) => ({
      vehicleId: vehicle.powerUnitId,
      unitNumber: vehicle.unitNumber,
      make: vehicle.make,
      vin: vehicle.vin,
      plate: vehicle.plate,
      vehicleType: VEHICLE_TYPES.POWER_UNIT,
      vehicleSubType: {
        typeCode: vehicle.powerUnitTypeCode,
        type: powerUnitSubTypes
          .find(subType => subType.typeCode === vehicle.powerUnitTypeCode)?.type,
      },
    })) as LOAVehicle[]
  , [powerUnitsData]);
  
  const trailers = useMemo(() => getDefaultRequiredVal([], trailersData)
    .map((vehicle) => ({
      vehicleId: vehicle.trailerId,
      unitNumber: vehicle.unitNumber,
      make: vehicle.make,
      vin: vehicle.vin,
      plate: vehicle.plate,
      vehicleType: VEHICLE_TYPES.TRAILER,
      vehicleSubType: {
        typeCode: vehicle.trailerTypeCode,
        type: trailerSubTypes
          .find(subType => subType.typeCode === vehicle.trailerTypeCode)?.type,
      },
    })) as LOAVehicle[]
  , [trailersData]);

  useEffect(() => {
    // If the fetched power units have ones that have been selected, fill the form data with vehicle information
    const selectedPowerUnits = getValues("selectedVehicles.powerUnits");
    const detailsOfSelectedIds = getVehicleDetailsForSelected(
      Object.keys(selectedPowerUnits),
      powerUnits,
    );

    setValue(
      "selectedVehicles.powerUnits",
      detailsOfSelectedIds,
    );
  }, [powerUnits, powerUnitSubTypes]);

  useEffect(() => {
    // If the fetched trailers have ones that have been selected, fill the form data with vehicle information
    const selectedTrailers = getValues("selectedVehicles.trailers");
    const detailsOfSelectedIds = getVehicleDetailsForSelected(
      Object.keys(selectedTrailers),
      trailers,
    );

    setValue(
      "selectedVehicles.trailers",
      detailsOfSelectedIds,
    );
  }, [trailers, trailerSubTypes]);
  
  const selectionForPowerUnitTable = Object.fromEntries(
    Object.entries(selectedPowerUnits)
      .filter(selected => Boolean(selected[1]))
      .map(([id]) => [`${VEHICLE_TYPES.POWER_UNIT}-${id}`, true]),
  );

  const selectionForTrailerTable = Object.fromEntries(
    Object.entries(selectedTrailers)
      .filter(selected => Boolean(selected[1]))
      .map(([id]) => [`${VEHICLE_TYPES.TRAILER}-${id}`, true]),
  );

  const handlePowerUnitSelectionChange = (
    selection: {
      [id: string]: boolean;
    },
  ) => {
    const updatedSelection = Object.entries(selection)
      .filter((selectionRow) => selectionRow[1])
      .map(([id]) => {
        // selection row ids are in the format "vehicleType-id" (eg. "powerUnit-1")
        return id.split("-")[1]; // we only want the vehicleId part (ie. "1" in the example above)
      });

    const detailsOfSelectedIds = getVehicleDetailsForSelected(updatedSelection, powerUnits);
    setValue(
      "selectedVehicles.powerUnits",
      detailsOfSelectedIds,
    );
    trigger("selectedVehicles");
  };

  const handleTrailerSelectionChange = (
    selection: {
      [id: string]: boolean;
    },
  ) => {
    const updatedSelection = Object.entries(selection)
      .filter((selectionRow) => selectionRow[1])
      .map(([id]) => {
        // selection row ids are in the format "vehicleType-id" (eg. "trailer-1")
        return id.split("-")[1]; // we only want the vehicleId part (ie. "1" in the example above)
      });

    const detailsOfSelectedIds = getVehicleDetailsForSelected(updatedSelection, trailers);
    setValue(
      "selectedVehicles.trailers",
      detailsOfSelectedIds,
    );
    trigger("selectedVehicles");
  };

  const hasSelectionErrors = Boolean(errors.selectedVehicles?.message);
  const tabComponents = [
    {
      label: "Power Unit",
      component: (
        <VehicleTable
          vehicles={powerUnits}
          selectedVehicles={selectionForPowerUnitTable}
          enablePagination={true}
          enableTopToolbar={true}
          onUpdateSelection={handlePowerUnitSelectionChange}
          hasError={hasSelectionErrors}
        />
      ),
    },
    {
      label: "Trailer",
      component: (
        <VehicleTable
          vehicles={trailers}
          selectedVehicles={selectionForTrailerTable}
          enablePagination={true}
          enableTopToolbar={true}
          onUpdateSelection={handleTrailerSelectionChange}
          hasError={hasSelectionErrors}
        />
      ),
    },
  ];

  return (
    <div className="loa-designate-vehicles">
      <div className="loa-designate-vehicles__header">
        Select Vehicle(s) for LOA
      </div>

      <InfoBcGovBanner
        msg={BANNER_MESSAGES.SELECT_VEHICLES_LOA}
        additionalInfo={
          <span className="loa-designate-vehicles__info-message">
            {BANNER_MESSAGES.SELECT_VEHICLES_LOA_INFO}
          </span>
        }
        className="loa-designate-vehicles__info-banner"
      />

      <Controller
        name="selectedVehicles"
        control={control}
        rules={vehicleSelectionRules}
        render={({
          fieldState: { error },
        }) => (
          <div className="loa-designate-vehicles__selection">
            <LOAVehicleTabLayout
              tabComponents={tabComponents}
              selectedTabIndex={vehicleTab}
              onTabChange={(tabIndex) => setVehicleTab(tabIndex as LOAVehicleTab)}
            />

            {error?.message ? (
              <div className="loa-designate-vehicles__selection-error">
                {error.message}
              </div>
            ) : null}
          </div>
        )}
      />
    </div>
  );
};
