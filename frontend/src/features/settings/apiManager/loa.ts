import { AxiosResponse } from "axios";

import { LOADetail } from "../types/LOADetail";
import { LOAFormData, serializeLOAFormData } from "../types/LOAFormData";
import { SPECIAL_AUTH_API_ROUTES } from "./endpoints/endpoints";
import { streamDownloadFile } from "../../../common/helpers/util";
import {
  httpDELETERequest,
  httpGETRequest,
  httpGETRequestStream,
  httpPOSTRequestWithFile,
  httpPUTRequestWithFile,
} from "../../../common/apiManager/httpRequestHandler";

/**
 * Get the LOAs for a given company.
 * @param companyId Company id of the company to get LOAs for
 * @param expired Whether or not to only fetch expired LOAs
 * @returns LOAs for the given company
 */
export const getLOAs = async (
  companyId: number | string,
  expired: boolean,
): Promise<LOADetail[]> => {
  const response = await httpGETRequest(
    SPECIAL_AUTH_API_ROUTES.LOA.ALL(companyId, expired),
  );
  return response.data;
};

/**
 * Get the LOA detail for a specific LOA.
 * @param companyId Company id of the company to get LOA for
 * @param loaId id of the LOA to fetch
 * @returns LOA detail for a given LOA
 */
export const getLOADetail = async (
  companyId: number | string,
  loaId: number,
): Promise<LOADetail> => {
  const response = await httpGETRequest(
    SPECIAL_AUTH_API_ROUTES.LOA.DETAIL(companyId, loaId),
  );
  return response.data;
};

/**
 * Create an LOA for a company.
 * @param LOAData Information about the LOA to be created for the company
 * @returns Result of creating the LOA, or error on fail
 */
export const createLOA = async (
  LOAData: {
    companyId: number | string;
    data: LOAFormData;
  },
): Promise<AxiosResponse<LOADetail>> => {
  const { companyId, data } = LOAData;
  return await httpPOSTRequestWithFile(
    SPECIAL_AUTH_API_ROUTES.LOA.CREATE(companyId),
    serializeLOAFormData(data),
  );
};

/**
 * Update an LOA for a company.
 * @param LOAData Information about the LOA to be updated for the company
 * @returns Result of updating the LOA, or error on fail
 */
export const updateLOA = async (
  LOAData: {
    companyId: number | string;
    loaId: number;
    data: LOAFormData;
  },
): Promise<AxiosResponse<LOADetail>> => {
  const { companyId, loaId, data } = LOAData;
  return await httpPUTRequestWithFile(
    SPECIAL_AUTH_API_ROUTES.LOA.UPDATE(companyId, loaId),
    serializeLOAFormData(data),
  );
};

/**
 * Remove an LOA for a company.
 * @param LOAData LOA id and id of the company to remove it from
 * @returns Result of removing the LOA, or error on fail
 */
export const removeLOA = async (
  LOAData: {
    companyId: number | string;
    loaId: number;
  },
): Promise<AxiosResponse<LOADetail>> => {
  const { companyId, loaId } = LOAData;
  return await httpDELETERequest(
    SPECIAL_AUTH_API_ROUTES.LOA.REMOVE(companyId, loaId),
  );
};

/**
 * Download LOA.
 * @param loaId id of the LOA to download
 * @param companyId id of the company that the LOA belongs to
 * @returns A Promise containing the dms reference string for the LOA download stream
 */
export const downloadLOA = async (
  loaId: number,
  companyId: string | number,
) => {
  const url = SPECIAL_AUTH_API_ROUTES.LOA.DOWNLOAD(companyId, loaId);
  const response = await httpGETRequestStream(url);
  return await streamDownloadFile(response);
};

/**
 * Remove an LOA document.
 * @param LOAData LOA id and id of the company to remove it from
 * @returns Result of removing the LOA document, or error on fail
 */
export const removeLOADocument = async (
  LOAData: {
    companyId: number | string;
    loaId: number;
  },
): Promise<AxiosResponse<LOADetail>> => {
  const { companyId, loaId } = LOAData;
  return await httpDELETERequest(
    SPECIAL_AUTH_API_ROUTES.LOA.REMOVE_DOCUMENT(companyId, loaId),
  );
};
