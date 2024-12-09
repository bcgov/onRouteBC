import { getDefaultRequiredVal } from "../../../common/helpers/util";
import { Nullable } from "../../../common/types/common";
import { PermitMailingAddress } from "../types/PermitMailingAddress";
import { PermitContactDetails } from "../types/PermitContactDetails";
import { PermitVehicleDetails } from "../types/PermitVehicleDetails";
import { PermitData } from "../types/PermitData";
import { PermitCondition } from "../types/PermitCondition";
import { arePermitLOADetailsEqual, PermitLOA } from "../types/PermitLOA";
import { areOrderedSequencesEqual, doUniqueArraysHaveSameObjects } from "../../../common/helpers/equality";
import { ReplaceDayjsWithString } from "../types/utility";
import { PermittedCommodity } from "../types/PermittedCommodity";
import { PermittedRoute } from "../types/PermittedRoute";
import { PermitVehicleConfiguration } from "../types/PermitVehicleConfiguration";

/**
 * Compare whether or not two mailing addresses are equal.
 * @param mailingAddress1 first mailing address info
 * @param mailingAddress2 second mailing address info
 * @returns true when mailing addresses are equivalent, false otherwise
 */
const areMailingAddressesEqual = (
  mailingAddress1?: PermitMailingAddress,
  mailingAddress2?: PermitMailingAddress,
) => {
  if (!mailingAddress1 && !mailingAddress2) return true; // considered equal when both are undefined
  if (!mailingAddress1 || !mailingAddress2) return false; // considered not equal when only one is undefined

  return (
    mailingAddress1.addressLine1 === mailingAddress2.addressLine1 &&
    mailingAddress1.city === mailingAddress2.city &&
    mailingAddress1.provinceCode === mailingAddress2.provinceCode &&
    mailingAddress1.countryCode === mailingAddress2.countryCode &&
    mailingAddress1.postalCode === mailingAddress2.postalCode &&
    ((!mailingAddress1.addressLine2 && !mailingAddress2.addressLine2) ||
      mailingAddress1.addressLine2 === mailingAddress2.addressLine2)
  );
};

/**
 * Compare whether or not two contact details are equal.
 * @param contactDetails1 first contact details info
 * @param contactDetails2 second contact details info
 * @returns true when contact details are equivalent, false otherwise
 */
const areContactDetailsEqual = (
  contactDetails1?: Nullable<PermitContactDetails>,
  contactDetails2?: Nullable<PermitContactDetails>,
) => {
  if (!contactDetails1 && !contactDetails2) return true; // considered equal when both are undefined
  if (!contactDetails1 || !contactDetails2) return false; // considered not equal when only one is undefined

  // Equal when all key-value pairs of both contacts details are equal
  return Object.entries(contactDetails1)
    .map(([key, val]) => {
      const val2 = contactDetails2[key as keyof PermitContactDetails]; // get value from second contact details for this key
      return getDefaultRequiredVal("", val) === getDefaultRequiredVal("", val2);
    })
    .reduce((prevIsEqual, currIsEqual) => prevIsEqual && currIsEqual, true);
};

/**
 * Compare whether or not two conditions lists are equal.
 * @param list1 first conditions list
 * @param list2 second conditions list
 * @returns true when conditions lists are equivalent, false otherwise
 */
export const areConditionsEqual = (
  list1: PermitCondition[],
  list2: PermitCondition[],
) => {
  // Instead of comparing arrays directly (as items can be in different orders), transform them into maps and compare key-value pairs
  const conditionMap1 = new Map(
    list1.map((condition1) => [condition1.condition, condition1]),
  );
  const conditionMap2 = new Map(
    list2.map((condition2) => [condition2.condition, condition2]),
  );

  // Compare all key-value pairs of first conditions map with key-value pairs of second conditions map
  for (const [conditionKey, condition] of conditionMap1) {
    if (condition.checked !== conditionMap2.get(conditionKey)?.checked) {
      return false;
    }
  }

  // Do the same the other way (ie. kv pairs of second map with kv pairs of first)
  for (const [conditionKey, condition] of conditionMap2) {
    if (condition.checked !== conditionMap1.get(conditionKey)?.checked) {
      return false;
    }
  }

  return true;
};

/**
 * Compare whether or not two vehicle details are equal.
 * @param vehicleDetails1 first vehicle details info
 * @param vehicleDetails2 second vehicle details info
 * @returns true when vehicle details are equivalent, false otherwise
 */
const areVehicleDetailsEqual = (
  vehicleDetails1?: Nullable<PermitVehicleDetails>,
  vehicleDetails2?: Nullable<PermitVehicleDetails>,
) => {
  if (!vehicleDetails1 && !vehicleDetails2) return true; // considered equal when both are undefined
  if (!vehicleDetails1 || !vehicleDetails2) return false; // considered not equal when only one is undefined

  // Equal when all key-value pairs of both contacts details are equal
  return Object.entries(vehicleDetails1)
    .map(([key, val]) => {
      const val2 = vehicleDetails2[key as keyof PermitVehicleDetails]; // get value from second vehicle details for this key
      return getDefaultRequiredVal("", val) === getDefaultRequiredVal("", val2);
    })
    .reduce((prevIsEqual, currIsEqual) => prevIsEqual && currIsEqual, true);
};

/**
 * Compare whether or not the LOAs for two permits are equal.
 * @param loas1 LOAs for first permit
 * @param loas2 LOAs for second permit
 * @returns true when the selected LOAs are the same, false otherwise
 */
export const arePermitLOAsEqual = (
  loas1: Nullable<PermitLOA[]>,
  loas2: Nullable<PermitLOA[]>,
) => {
  const isLoas1Empty = !loas1 || loas1.length === 0;
  const isLoas2Empty = !loas2 || loas2.length === 0;

  if (isLoas1Empty && isLoas2Empty) return true;
  if ((isLoas1Empty && !isLoas2Empty) || (!isLoas1Empty && isLoas2Empty))
    return false;

  return doUniqueArraysHaveSameObjects(
    loas1 as PermitLOA[],
    loas2 as PermitLOA[],
    (loa) => loa.loaNumber,
    arePermitLOADetailsEqual,
  );
};

/**
 * Compare whether or not the permitted commodities for two permits are equal.
 * @param permittedCommodity1 Permitted commodity belonging to the first permit
 * @param permittedCommodity2 Permitted commodity belonging to the second permit
 * @returns true when the two permitted commodities are equivalent, false otherwise
 */
export const arePermittedCommoditiesEqual = (
  permittedCommodity1?: Nullable<PermittedCommodity>,
  permittedCommodity2?: Nullable<PermittedCommodity>,
) => {
  return (
    getDefaultRequiredVal("", permittedCommodity1?.commodityType)
      === getDefaultRequiredVal("", permittedCommodity2?.commodityType)
  ) && (
    getDefaultRequiredVal("", permittedCommodity1?.loadDescription)
      === getDefaultRequiredVal("", permittedCommodity2?.loadDescription)
  );
};

/**
 * Compare whether or not the permitted route details for two permits are equal.
 * @param permittedRoute1 Permitted route details belonging to the first permit
 * @param permittedRoute2 Permitted route details belonging to the second permit
 * @returns true when the permitted route details are considered equivalent, false otherwise
 */
export const areVehicleConfigurationsEqual = (
  vehicleConfig1?: Nullable<PermitVehicleConfiguration>,
  vehicleConfig2?: Nullable<PermitVehicleConfiguration>,
) => {
  return (
    getDefaultRequiredVal(0, vehicleConfig1?.overallWidth)
      === getDefaultRequiredVal(0, vehicleConfig2?.overallWidth)
  ) && (
    getDefaultRequiredVal(0, vehicleConfig1?.overallHeight)
      === getDefaultRequiredVal(0, vehicleConfig2?.overallHeight)
  ) && (
    getDefaultRequiredVal(0, vehicleConfig1?.overallLength)
      === getDefaultRequiredVal(0, vehicleConfig2?.overallLength)
  ) && (
    getDefaultRequiredVal(0, vehicleConfig1?.frontProjection)
      === getDefaultRequiredVal(0, vehicleConfig2?.frontProjection)
  ) && (
    getDefaultRequiredVal(0, vehicleConfig1?.rearProjection)
      === getDefaultRequiredVal(0, vehicleConfig2?.rearProjection)
  ) && areOrderedSequencesEqual(
    vehicleConfig1?.trailers,
    vehicleConfig2?.trailers,
    (trailer1, trailer2) => trailer1.vehicleSubType === trailer2.vehicleSubType,
  );
};

/**
 * Compare whether or not the permitted route details for two permits are equal.
 * @param permittedRoute1 Permitted route details belonging to the first permit
 * @param permittedRoute2 Permitted route details belonging to the second permit
 * @returns true when the permitted route details are considered equivalent, false otherwise
 */
export const arePermittedRoutesEqual = (
  permittedRoute1?: Nullable<PermittedRoute>,
  permittedRoute2?: Nullable<PermittedRoute>,
) => {
  return (
    getDefaultRequiredVal("", permittedRoute1?.manualRoute?.origin)
      === getDefaultRequiredVal("", permittedRoute2?.manualRoute?.origin)
  ) && (
    getDefaultRequiredVal("", permittedRoute1?.manualRoute?.destination)
      === getDefaultRequiredVal("", permittedRoute2?.manualRoute?.destination)
  ) && (
    getDefaultRequiredVal("", permittedRoute1?.manualRoute?.exitPoint)
      === getDefaultRequiredVal("", permittedRoute2?.manualRoute?.exitPoint)
  ) && (
    getDefaultRequiredVal(0, permittedRoute1?.manualRoute?.totalDistance)
      === getDefaultRequiredVal(0, permittedRoute2?.manualRoute?.totalDistance)
  ) && (
    getDefaultRequiredVal("", permittedRoute1?.routeDetails)
      === getDefaultRequiredVal("", permittedRoute2?.routeDetails)
  ) && areOrderedSequencesEqual(
    permittedRoute1?.manualRoute?.highwaySequence,
    permittedRoute2?.manualRoute?.highwaySequence,
    (seqNumber1, seqNumber2) => seqNumber1 === seqNumber2,
  );
};

/**
 * Compare whether or not the permit data belonging to two applications are equal.
 * @param data1 Permit data belonging to first application
 * @param data2 Permit data belonging to second application
 * @returns true when permit data are equivalent, false otherwise
 */
export const areApplicationPermitDataEqual = (
  data1: ReplaceDayjsWithString<PermitData>,
  data2: ReplaceDayjsWithString<PermitData>,
) => {
  return (
    data1.permitDuration === data2.permitDuration &&
    data1.startDate === data2.startDate &&
    data1.expiryDate === data2.expiryDate &&
    areContactDetailsEqual(data1.contactDetails, data2.contactDetails) &&
    areVehicleDetailsEqual(data1.vehicleDetails, data2.vehicleDetails) &&
    areConditionsEqual(data1.commodities, data2.commodities) &&
    areMailingAddressesEqual(data1.mailingAddress, data2.mailingAddress) &&
    arePermitLOAsEqual(data1.loas, data2.loas) &&
    arePermittedCommoditiesEqual(data1.permittedCommodity, data2.permittedCommodity) &&
    areVehicleConfigurationsEqual(data1.vehicleConfiguration, data2.vehicleConfiguration) &&
    arePermittedRoutesEqual(data1.permittedRoute, data2.permittedRoute) &&
    (getDefaultRequiredVal("", data1.applicationNotes)
      === getDefaultRequiredVal("", data2.applicationNotes)) &&
    ((!data1.companyName && !data2.companyName) ||
      data1.companyName === data2.companyName) &&
    ((!data1.doingBusinessAs && !data2.doingBusinessAs) ||
      data1.doingBusinessAs === data2.doingBusinessAs) &&
    ((!data1.clientNumber && !data2.clientNumber) ||
      data1.clientNumber === data2.clientNumber)
  );
};
