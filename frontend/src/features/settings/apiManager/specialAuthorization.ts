import { AxiosResponse } from "axios";

import { NoFeePermitType, SpecialAuthorizationData } from "../types/SpecialAuthorization";
import { SPECIAL_AUTH_API_ROUTES } from "./endpoints/endpoints";
import { RequiredOrNull } from "../../../common/types/common";
import {
  httpGETRequest,
  httpPUTRequest,
} from "../../../common/apiManager/httpRequestHandler";

/**
 * Get the special authorizations info for a given company.
 * @param companyId Company id of the company to get special authorizations info for
 * @returns Special authorizations info for the given company
 */
export const getSpecialAuthorizations = async (
  companyId: number | string,
): Promise<SpecialAuthorizationData> => {
  const response = await httpGETRequest(
    SPECIAL_AUTH_API_ROUTES.SPECIAL_AUTH.GET(companyId),
  );
  return response.data;
};

/**
 * Update the no-fee flag for a company.
 * @param NoFeeData Information for the no-fee flag to be updated for the company
 * @returns Result of updating the no-fee flag, or error on fail
 */
export const updateNoFee = async (
  NoFeeData: {
    companyId: number | string;
    noFee: RequiredOrNull<NoFeePermitType>;
  },
): Promise<AxiosResponse<SpecialAuthorizationData>> => {
  const { companyId, noFee } = NoFeeData;
  return await httpPUTRequest(
    SPECIAL_AUTH_API_ROUTES.SPECIAL_AUTH.UPDATE_NO_FEE(companyId),
    { noFeeType: noFee },
  );
};

/**
 * Update the LCV flag for a company.
 * @param NoFeeData Information for the LCV flag to be updated for the company
 * @returns Result of updating the LCV flag, or error on fail
 */
export const updateLCV = async (
  NoFeeData: {
    companyId: number | string;
    isLcvAllowed: boolean;
  },
): Promise<AxiosResponse<SpecialAuthorizationData>> => {
  const { companyId, isLcvAllowed } = NoFeeData;
  return await httpPUTRequest(
    SPECIAL_AUTH_API_ROUTES.SPECIAL_AUTH.UPDATE_LCV(companyId),
    { isLcvAllowed },
  );
};
