import { Dayjs } from "dayjs";

import { Nullable } from "../../../common/types/common";
import { PERMIT_TYPES } from "../../permits/types/PermitType";
import { LOAVehicle } from "./LOAVehicle";
import { LOADetail } from "./LOADetail";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../common/helpers/util";

import {
  DATE_FORMATS,
  dayjsToLocalStr,
  getEndOfDate,
  getStartOfDate,
  now,
  toLocalDayjs,
} from "../../../common/helpers/formatDate";

export interface LOAFormData {
  permitTypes: {
    [PERMIT_TYPES.STOS]: boolean;
    [PERMIT_TYPES.TROS]: boolean;
    [PERMIT_TYPES.STOW]: boolean;
    [PERMIT_TYPES.TROW]: boolean;
    [PERMIT_TYPES.STOL]: boolean;
    [PERMIT_TYPES.STWS]: boolean;
  };
  startDate: Dayjs;
  expiryDate?: Nullable<Dayjs>;
  neverExpires: boolean;
  uploadFile: Nullable<{
    fileName: string;
  }> | File;
  additionalNotes?: Nullable<string>;
  selectedVehicles: {
    powerUnits: Record<string, Nullable<LOAVehicle>>;
    trailers: Record<string, Nullable<LOAVehicle>>;
  };
}

/**
 * Transform LOA detail response object to form data.
 * @param loaDetail LOA detail object received as response
 * @returns Form data values for the LOA
 */
export const loaDetailToFormData = (
  loaDetail?: Nullable<LOADetail>,
): LOAFormData => {
  const loaDetailPermitTypes = getDefaultRequiredVal([], loaDetail?.loaPermitType);
  const permitTypes = {
    [PERMIT_TYPES.STOS]: loaDetailPermitTypes.includes(PERMIT_TYPES.STOS),
    [PERMIT_TYPES.TROS]: loaDetailPermitTypes.includes(PERMIT_TYPES.TROS),
    [PERMIT_TYPES.STOW]: loaDetailPermitTypes.includes(PERMIT_TYPES.STOW),
    [PERMIT_TYPES.TROW]: loaDetailPermitTypes.includes(PERMIT_TYPES.TROW),
    [PERMIT_TYPES.STOL]: loaDetailPermitTypes.includes(PERMIT_TYPES.STOL),
    [PERMIT_TYPES.STWS]: loaDetailPermitTypes.includes(PERMIT_TYPES.STWS),
  };

  const startDate = applyWhenNotNullable(
    startDateStr => getStartOfDate(toLocalDayjs(startDateStr)),
    loaDetail?.startDate,
    now(),
  );
  const expiryDate = applyWhenNotNullable(
    expiryDateStr => getEndOfDate(toLocalDayjs(expiryDateStr)),
    loaDetail?.expiryDate,
    null,
  );
  const neverExpires = !expiryDate;
  const additionalNotes = getDefaultRequiredVal("", loaDetail?.comment);
  const powerUnits = applyWhenNotNullable(
    powerUnitsArr => Object.fromEntries(powerUnitsArr.map(powerUnitId => [powerUnitId, null])),
    loaDetail?.powerUnits,
    {},
  );
  const trailers = applyWhenNotNullable(
    trailersArr => Object.fromEntries(trailersArr.map(trailerId => [trailerId, null])),
    loaDetail?.trailers,
    {},
  );
  const defaultFile = loaDetail?.documentId ? {
    fileName: getDefaultRequiredVal("", loaDetail?.fileName),
  } : null;

  return {
    permitTypes,
    startDate,
    expiryDate,
    neverExpires,
    uploadFile: defaultFile,
    additionalNotes,
    selectedVehicles: {
      powerUnits,
      trailers,
    },
  };
};

/**
 * Serialize LOA form data for create or update request payloads.
 * @param loaFormData Populated form data for the LOA
 * @returns Serialized request payload for creating or updating an LOA
 */
export const serializeLOAFormData = (loaFormData: LOAFormData) => {
  const requestData = new FormData();

  const permitTypes = Object.entries(loaFormData.permitTypes)
    .filter(([, selected]) => {
      return selected;
    })
    .map(([permitType]) => permitType);

  const powerUnits = Object.keys(loaFormData.selectedVehicles.powerUnits);
  const trailers = Object.keys(loaFormData.selectedVehicles.trailers);
  
  const body = {
    startDate: dayjsToLocalStr(loaFormData.startDate, DATE_FORMATS.DATEONLY),
    expiryDate: loaFormData.expiryDate
      ? dayjsToLocalStr(loaFormData.expiryDate, DATE_FORMATS.DATEONLY)
      : null,
    comment: getDefaultRequiredVal("", loaFormData.additionalNotes),
    loaPermitType: permitTypes,
    powerUnits: powerUnits.length > 0 ? powerUnits : undefined,
    trailers: trailers.length > 0 ? trailers : undefined,
  };

  if (loaFormData.uploadFile instanceof File) {
    // is newly uploaded file
    requestData.append("file", loaFormData.uploadFile);
  }

  requestData.append("body", JSON.stringify(body));
  
  return requestData;
};
