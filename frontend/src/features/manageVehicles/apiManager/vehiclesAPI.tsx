import { VEHICLES_API } from "./endpoints/endpoints";
import { replaceEmptyValuesWithNull } from "../../../common/helpers/util";
import { Nullable } from "../../../common/types/common";
import { EMPTY_VEHICLE_UNIT_NUMBER } from "../../../common/constants/constants";
import {
  PowerUnit,
  PowerUnitUpdateData,
  VehicleSubType,
  Trailer,
  TrailerUpdateData,
  PowerUnitCreateData,
  TrailerCreateData,
} from "../types/Vehicle";

import {
  httpPOSTRequest,
  httpPUTRequest,
  httpGETRequest,
} from "../../../common/apiManager/httpRequestHandler";

const emptyUnitNumberToNull = (unitNumber?: Nullable<string>) => {
  return !unitNumber || unitNumber === EMPTY_VEHICLE_UNIT_NUMBER
    ? null
    : unitNumber;
};

/**
 * Fetch all power units for a company.
 * @param companyId Company id of company to fetch for
 * @return Response of all power units
 */
export const getAllPowerUnits = async (
  companyId: number,
): Promise<PowerUnit[]> => {
  const url = VEHICLES_API.POWER_UNITS.ALL(companyId);
  return httpGETRequest(url).then((response) => response.data);
};

/**
 * Fetch power unit details.
 * @param powerUnitId The id of the power unit to fetch for
 * @param companyId The id of the company to fetch for
 * @returns Response data for power unit details
 */
export const getPowerUnit = async (
  powerUnitId: string,
  companyId: number,
): Promise<PowerUnit> => {
  const url = VEHICLES_API.POWER_UNITS.DETAIL(companyId, powerUnitId);
  return httpGETRequest(url).then((response) => response.data);
};

/**
 * Fetch power unit vehicle subtypes.
 * @returns List of vehicle subtypes for power units.
 */
export const getPowerUnitSubTypes = async (): Promise<VehicleSubType[]> => {
  const url = new URL(VEHICLES_API.POWER_UNIT_TYPES);
  return httpGETRequest(url.toString()).then((response) => response.data);
};

/**
 * Create a power unit.
 * @param companyId Id of company to add to
 * @param powerUnit Data for the power unit to be added
 * @returns Response of the power unit creation operation
 */
export const addPowerUnit = async ({
  companyId,
  powerUnit,
}: {
  companyId: number;
  powerUnit: PowerUnitCreateData;
}) => {
  const url = VEHICLES_API.POWER_UNITS.ADD(companyId);

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { powerUnitId: id, unitNumber, ...powerUnitReqData } = powerUnit;

  return await httpPOSTRequest(url, {
    ...replaceEmptyValuesWithNull(powerUnitReqData),
    unitNumber: emptyUnitNumberToNull(unitNumber),
  });
};

/**
 * Update a power unit.
 * @param companyId Id of company to update power unit for
 * @param powerUnit Updated data for the power unit
 * @param powerUnitId Id of the power unit
 * @returns Response of the power unit update operation
 */
export const updatePowerUnit = async ({
  companyId,
  powerUnit,
  powerUnitId,
}: {
  companyId: number;
  powerUnit: PowerUnitUpdateData;
  powerUnitId: string;
}) => {
  const url = VEHICLES_API.POWER_UNITS.UPDATE(companyId, powerUnitId);

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { powerUnitId: id, unitNumber, ...powerUnitReqData } = powerUnit;
  return await httpPUTRequest(url, {
    ...replaceEmptyValuesWithNull(powerUnitReqData),
    unitNumber: emptyUnitNumberToNull(unitNumber),
  });
};

/**
 * Fetch all trailers for a company.
 * @param companyId Id of the company to fetch for.
 * @return Response of all trailers
 */
export const getAllTrailers = async (companyId: number): Promise<Trailer[]> => {
  const url = VEHICLES_API.TRAILERS.ALL(companyId);
  return httpGETRequest(url).then((response) => response.data);
};

/**
 * Fetch trailer details.
 * @param trailerId The id of the trailer to fetch for
 * @param companyId The id of the company to fetch for
 * @returns Response data for trailer details
 */
export const getTrailer = async (
  trailerId: string,
  companyId: number,
): Promise<Trailer> => {
  const url = VEHICLES_API.TRAILERS.DETAIL(companyId, trailerId);
  return httpGETRequest(url).then((response) => response.data);
};

/**
 * Fetch trailer vehicle subtypes.
 * @returns Response of vehicle subtypes for trailers.
 */
export const getTrailerSubTypes = async (): Promise<VehicleSubType[]> => {
  const url = new URL(VEHICLES_API.TRAILER_TYPES);
  return httpGETRequest(url.toString()).then((response) => response.data);
};

/**
 * Create a trailer.
 * @param companyId Id of company to create the trailer for
 * @param trailer Data of the trailer to be created
 * @returns Response of the trailer creation operation
 */
export const addTrailer = async ({
  companyId,
  trailer,
}: {
  companyId: number;
  trailer: TrailerCreateData;
}) => {
  const url = VEHICLES_API.TRAILERS.ADD(companyId);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { trailerId, unitNumber, ...trailerReqData } = trailer;
  return await httpPOSTRequest(url, {
    ...replaceEmptyValuesWithNull(trailerReqData),
    unitNumber: emptyUnitNumberToNull(unitNumber),
  });
};

/**
 * Update a trailer.
 * @param companyId Id of the company to update the trailer for
 * @param trailerId The id for the trailer to be updated
 * @param trailer Updated data of the trailer
 * @returns Response of the trailer update operation
 */
export const updateTrailer = async ({
  companyId,
  trailerId,
  trailer,
}: {
  companyId: number;
  trailerId: string;
  trailer: TrailerUpdateData;
}) => {
  const url = VEHICLES_API.TRAILERS.UPDATE(companyId, trailerId);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { trailerId: id, unitNumber, ...trailerReqData } = trailer;
  return await httpPUTRequest(url, {
    ...replaceEmptyValuesWithNull(trailerReqData),
    unitNumber: emptyUnitNumberToNull(unitNumber),
  });
};

/**
 * Delete one or more power units.
 * @param vehicleIds Ids for the power units to be deleted
 * @param companyId Id of the company to delete from
 * @returns Response of the delete operation
 */
export const deletePowerUnits = async (
  vehicleIds: string[],
  companyId: number,
) => {
  const url = VEHICLES_API.POWER_UNITS.DELETE(companyId);
  return await httpPOSTRequest(url, replaceEmptyValuesWithNull({ powerUnits: vehicleIds }));
};

/**
 * Delete one or more trailers.
 * @param vehicleIds Ids for the trailers to be deleted
 * @param companyId Id of the company to delete from
 * @returns Response of the delete operation
 */
export const deleteTrailers = async (
  vehicleIds: string[],
  companyId: number,
) => {
  const url = VEHICLES_API.TRAILERS.DELETE(companyId);
  return await httpPOSTRequest(url, replaceEmptyValuesWithNull({ trailers: vehicleIds }));
};
