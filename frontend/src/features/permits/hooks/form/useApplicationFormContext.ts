import { useContext } from "react";
import { Policy } from "onroute-policy-engine";

import { ApplicationFormContext } from "../../context/ApplicationFormContext";
import { usePermitDateSelection } from "../usePermitDateSelection";
import { usePermitConditions } from "../usePermitConditions";
import { getStartOfDate } from "../../../../common/helpers/formatDate";
import { usePermitVehicles } from "../usePermitVehicles";
import { arePermitLOADetailsEqual } from "../../types/PermitLOA";
import { useMemoizedArray } from "../../../../common/hooks/useMemoizedArray";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import { arePermitConditionEqual } from "../../types/PermitCondition";
import { useMemoizedObject } from "../../../../common/hooks/useMemoizedObject";
import { useVehicleConfiguration } from "../useVehicleConfiguration";
import { useApplicationFormUpdateMethods } from "./useApplicationFormUpdateMethods";
import { usePermittedCommodity } from "../usePermittedCommodity";
import { DEFAULT_COMMODITY_SELECT_VALUE } from "../../constants/constants";

export const useApplicationFormContext = () => {
  const applicationFormContextData = useContext(ApplicationFormContext);
  const {
    initialFormData,
    formData,
    durationOptions,
    allVehiclesFromInventory,
    powerUnitSubtypeNamesMap,
    trailerSubtypeNamesMap,
    isLcvDesignated,
    feature,
    companyInfo,
    isAmendAction,
    createdDateTime,
    updatedDateTime,
    pastStartDateStatus,
    companyLOAs,
    revisionHistory,
    onLeave,
    onSave,
    onCancel,
    onContinue,
  } = applicationFormContextData;

  // This assignment is type-safe since the parent component ensured that
  // the loading page or error page is rendered when policy engine is null/undefined
  const policyEngine = applicationFormContextData.policyEngine as Policy;

  const {
    onSetDuration,
    onSetExpiryDate,
    onSetConditions,
    onToggleSaveVehicle,
    onSetVehicle,
    onClearVehicle,
    onUpdateLOAs,
    onUpdateHighwaySequence,
    onUpdateVehicleConfigTrailers,
    onSetCommodityType,
    onUpdateVehicleConfig,
    onClearVehicleConfig,
  } = useApplicationFormUpdateMethods();

  const {
    permitType,
    applicationNumber,
    permitNumber,
  } = formData;

  const {
    expiryDate: permitExpiryDate,
    loas,
    permitDuration,
    startDate: permitStartDate,
    commodities,
    vehicleDetails: vehicleFormData,
    permittedRoute,
    permittedCommodity,
    vehicleConfiguration,
  } = formData.permitData;

  const createdAt = useMemoizedObject(
    createdDateTime,
    (dateObj1, dateObj2) => Boolean(
      (!dateObj1 && !dateObj2) || (dateObj1 && dateObj2 && dateObj1.isSame(dateObj2)),
    ),
  );

  const updatedAt = useMemoizedObject(
    updatedDateTime,
    (dateObj1, dateObj2) => Boolean(
      (!dateObj1 && !dateObj2) || (dateObj1 && dateObj2 && dateObj1.isSame(dateObj2)),
    ),
  );

  const startDate = useMemoizedObject(
    getStartOfDate(permitStartDate),
    (dateObj1, dateObj2) => dateObj1.isSame(dateObj2),
  );

  const expiryDate = useMemoizedObject(
    permitExpiryDate,
    (dateObj1, dateObj2) => dateObj1.isSame(dateObj2),
  );

  const currentSelectedLOAs = useMemoizedArray(
    getDefaultRequiredVal([], loas),
    ({ loaNumber }) => loaNumber,
    arePermitLOADetailsEqual,
  );

  const permitConditions = useMemoizedArray(
    commodities,
    ({ condition }) => condition,
    arePermitConditionEqual,
  );

  // Update duration options and expiry when needed
  const { availableDurationOptions } = usePermitDateSelection(
    permitType,
    startDate,
    durationOptions,
    currentSelectedLOAs,
    permitDuration,
    onSetDuration,
    onSetExpiryDate,
  );
  
  // Update permit conditions when LCV designation or vehicle subtype changes
  const { allConditions } = usePermitConditions(
    permitType,
    permitConditions,
    isLcvDesignated,
    vehicleFormData.vehicleSubType,
    onSetConditions,
  );

  const {
    commodityOptions,
    onChangeCommodityType,
  } = usePermittedCommodity(
    policyEngine,
    permitType,
    onSetCommodityType,
    () => onClearVehicle(Boolean(vehicleFormData.saveVehicle)),
    onClearVehicleConfig,
    permittedCommodity?.commodityType,
  );

  // Check to see if vehicle details is still valid after LOA has been deselected
  // Also get vehicle subtype options, and whether or not selected vehicle is an LOA vehicle
  const {
    filteredVehicleOptions,
    subtypeOptions,
    isSelectedLOAVehicle,
  } = usePermitVehicles({
    policyEngine,
    permitType,
    isLcvDesignated,
    vehicleFormData,
    allVehiclesFromInventory,
    selectedLOAs: currentSelectedLOAs,
    powerUnitSubtypeNamesMap,
    trailerSubtypeNamesMap,
    onClearVehicle: () => onClearVehicle(Boolean(vehicleFormData.saveVehicle)),
    selectedCommodity: permittedCommodity?.commodityType,
  });

  const selectedVehicleConfigSubtypes = useMemoizedArray(
    getDefaultRequiredVal(
      [],
      vehicleConfiguration?.trailers?.map(({ vehicleSubType }) => vehicleSubType),
    ),
    (subtype) => subtype,
    (subtype1, subtype2) => subtype1 === subtype2,
  );

  const { nextAllowedSubtypes } = useVehicleConfiguration(
    policyEngine,
    permitType,
    getDefaultRequiredVal(
      DEFAULT_COMMODITY_SELECT_VALUE,
      permittedCommodity?.commodityType,
    ),
    selectedVehicleConfigSubtypes,
    vehicleFormData.vehicleSubType,
    onUpdateVehicleConfigTrailers,
  );

  const memoizedCompanyLOAs = useMemoizedArray(
    companyLOAs,
    ({ loaNumber }) => loaNumber,
    arePermitLOADetailsEqual,
  );

  const memoizedRevisionHistory = useMemoizedArray(
    revisionHistory,
    (historyItem) => `${historyItem.permitId}-${historyItem.revisionDateTime}`,
    (historyItem1, historyItem2) =>
      historyItem1.permitId === historyItem2.permitId
        && historyItem1.revisionDateTime === historyItem2.revisionDateTime
        && historyItem1.name === historyItem2.name
        && historyItem1.comment === historyItem2.comment,
  );

  const highwaySequence = useMemoizedObject(
    getDefaultRequiredVal([], permittedRoute?.manualRoute?.highwaySequence),
    (seq1, seq2) =>
      seq1.length === seq2.length
      && seq1.every((num, index) => num === seq2[index]),
  );

  return {
    initialFormData,
    permitType,
    applicationNumber,
    permitNumber,
    startDate,
    expiryDate,
    currentSelectedLOAs,
    vehicleFormData,
    allConditions,
    availableDurationOptions,
    filteredVehicleOptions,
    subtypeOptions,
    isSelectedLOAVehicle,
    feature,
    companyInfo,
    isAmendAction,
    createdDateTime: createdAt,
    updatedDateTime: updatedAt,
    pastStartDateStatus,
    companyLOAs: memoizedCompanyLOAs,
    revisionHistory: memoizedRevisionHistory,
    commodityOptions,
    highwaySequence,
    nextAllowedSubtypes,
    powerUnitSubtypeNamesMap,
    trailerSubtypeNamesMap,
    selectedVehicleConfigSubtypes,
    vehicleConfiguration,
    onLeave,
    onSave,
    onCancel,
    onContinue,
    onSetDuration,
    onSetExpiryDate,
    onSetConditions,
    onToggleSaveVehicle,
    onSetVehicle,
    onClearVehicle,
    onUpdateLOAs,
    onUpdateHighwaySequence,
    onUpdateVehicleConfigTrailers,
    commodityType: permittedCommodity?.commodityType,
    onChangeCommodityType,
    onUpdateVehicleConfig,
  };
};