import { VEHICLES_URL } from "../../../common/apiManager/endpoints/endpoints";
import { BCeIDUserContextType } from "../../../common/authentication/types";
import { replaceEmptyValuesWithNull } from "../../../common/helpers/util";
import { RequiredOrNull } from "../../../common/types/common";
import { MANAGE_PROFILE_API } from "./endpoints/endpoints";
import {
  httpGETRequest,
  httpPOSTRequest,
  httpPUTRequest,
  getCompanyIdFromSession,
  getUserGuidFromSession,
  httpDELETERequest,
} from "../../../common/apiManager/httpRequestHandler";

import {
  CompanyProfile,
  CreateCompanyRequest,
  ReadUserInformationResponse,
  Contact,
  VerifyClientRequest,
  VerifyMigratedClientResponse,
  UpdateCompanyProfileRequest,
  UserInfoRequest,
  BCeIDAddUserRequest,
} from "../types/manageProfile";

export const getCompanyInfo = async (): Promise<CompanyProfile> => {
  const url = MANAGE_PROFILE_API.COMPANIES + "/" + getCompanyIdFromSession();
  return httpGETRequest(url).then((response) => response.data);
};

export const getCompanyInfoById = async (
  companyId: number,
): Promise<RequiredOrNull<CompanyProfile>> => {
  const response = await httpGETRequest(
    `${MANAGE_PROFILE_API.COMPANIES}/${companyId}`,
  );
  return response.data;
};

export const getMyInfo = async (): Promise<ReadUserInformationResponse> => {
  const url = `${MANAGE_PROFILE_API.MY_INFO}/${getUserGuidFromSession()}`;

  return httpGETRequest(url).then((response) => response.data);
};

export const updateCompanyInfo = async ({
  companyInfo,
}: {
  companyInfo: UpdateCompanyProfileRequest;
}) => {
  return await httpPUTRequest(
    `${MANAGE_PROFILE_API.COMPANIES}/${getCompanyIdFromSession()}`,
    replaceEmptyValuesWithNull(companyInfo),
  );
};

/**
 * Updates my information (i.e., the logged in user's BCeID profile information)
 * @param myInfo The request object.
 * @returns AxiosResponse with the updated user details.
 */
export const updateMyInfo = async ({ myInfo }: { myInfo: UserInfoRequest }) => {
  return await httpPUTRequest(
    `${
      MANAGE_PROFILE_API.COMPANIES
    }/${getCompanyIdFromSession()}/users/${getUserGuidFromSession()}`,
    replaceEmptyValuesWithNull(myInfo),
  );
};

/**
 * Creates a BCeID user profile for a company.
 * @param myInfo The request object.
 * @returns The AxiosResponse containing created user's details.
 */
export const createMyOnRouteBCUserProfile = async ({
  myInfo,
}: {
  myInfo: Contact;
}) => {
  return await httpPOSTRequest(
    `${MANAGE_PROFILE_API.COMPANIES}/${getCompanyIdFromSession()}/users`,
    replaceEmptyValuesWithNull(myInfo),
  );
};

/**
 * Creates an onRouteBC company profile.
 * @param onRouteBCProfileRequestObject The request object containing the profile details
 * @returns A Promise containing the response from the API.
 */
export const createOnRouteBCProfile = (
  onRouteBCProfileRequestObject: CreateCompanyRequest,
) => {
  return httpPOSTRequest(
    `${MANAGE_PROFILE_API.COMPANIES}`,
    replaceEmptyValuesWithNull(onRouteBCProfileRequestObject),
  );
};

/**
 * Verifies a migrated client through an API call.
 * @param requestPayload The verify migrated client form values.
 * @returns A promise containing details of the verification.
 */
export const verifyMigratedClient = (
  requestPayload: VerifyClientRequest,
): Promise<VerifyMigratedClientResponse> => {
  return httpPOSTRequest(
    `${VEHICLES_URL}/companies/verify-client`,
    replaceEmptyValuesWithNull(requestPayload),
  ).then((response) => response.data);
};

/**
 * Retrieve the company and user details post login.
 */
export const getUserContext = (): Promise<BCeIDUserContextType> => {
  const url = `${VEHICLES_URL}/users/user-context`;
  return httpPOSTRequest(url, {}).then((response) => response.data);
};

/**
 * Retrieves the claims of the user w.r.t a company.
 */
export const getUserClaimsByCompanyId = (): Promise<string[]> => {
  const companyId = getCompanyIdFromSession();
  let url = `${VEHICLES_URL}/users/claims`;
  if (companyId) {
    url += `?companyId=${companyId}`;
  }
  return httpGETRequest(url).then((response) => response.data);
};

/**
 * Retrieves the claims of an IDIR user (i.e., OnRouteBC staff).
 */
export const getIDIRUserClaims = async (): Promise<
  RequiredOrNull<string[]>
> => {
  return httpGETRequest(`${VEHICLES_URL}/users/claims`).then(
    (response) => response.data,
  );
};

/**
 * Retrieves the users of a company by companyId
 * @returns a promise containing the users.
 */
export const getCompanyUsers = (): Promise<ReadUserInformationResponse[]> => {
  return httpGETRequest(
    `${VEHICLES_URL}/companies/${getCompanyIdFromSession()}/users?includePendingUser=true`,
  ).then((response) => response.data);
};

/**
 * Retrieves the users of a company by companyId
 * @returns a promise containing the users.
 */
export const getCompanyPendingUsers = (): Promise<
  ReadUserInformationResponse[]
> => {
  return httpGETRequest(
    `${VEHICLES_URL}/companies/${getCompanyIdFromSession()}/pending-users`,
  ).then((response) => response.data);
};

/**
 * Adds a user to a company.
 * @param addUserRequest The request object containing the user details
 * @returns A Promise containing the response from the API.
 */
export const addUserToCompany = async (addUserRequest: BCeIDAddUserRequest) => {
  return await httpPOSTRequest(
    `${
      MANAGE_PROFILE_API.COMPANIES
    }/${getCompanyIdFromSession()}/pending-users`,
    replaceEmptyValuesWithNull(addUserRequest),
  );
};

/**
 * Deletes active users of a company identified by their user GUIDs.
 * @param userGuids The array of user GUIDs of the users to be deleted.
 * @returns A promise indicating the success or failure of the delete operation.
 */
export const deleteCompanyActiveUsers = (userGuids: string[]) => {
  return httpDELETERequest(
    `${VEHICLES_URL}/companies/${getCompanyIdFromSession()}/users/`,
    {
      userGUIDs: userGuids,
    },
  );
};

/**
 * Deletes pending users of a company identified by their user GUIDs.
 * @param userNames The array of usernames of the pending users to be deleted.
 * @returns A promise indicating the success or failure of the delete operation.
 */
export const deleteCompanyPendingUsers = (userNames: string[]) => {
  return httpDELETERequest(
    `${VEHICLES_URL}/companies/${getCompanyIdFromSession()}/pending-users/`,
    {
      userNames,
    },
  );
};

/**
 * Retrieves a users of a company by the user's userGUID.
 * (For admin's user management operations)
 * @returns a promise containing the user.
 */
export const getCompanyUserByUserGUID = (
  userGUID: string,
): Promise<ReadUserInformationResponse> => {
  return httpGETRequest(
    `${
      MANAGE_PROFILE_API.COMPANIES
    }/${getCompanyIdFromSession()}/users/${userGUID}`,
  ).then((response) => response.data);
};

/**
 * Updates the user details for a user identified by the userGuid.
 * @param userInfo The request object.
 * @param userGUID The user guid of the user whose details will be updated.
 * @returns A Promise with the API response.
 */
export const updateUserInfo = async ({
  userInfo,
  userGUID,
}: {
  /**
   * The request object with updated user details.
   */
  userInfo: UserInfoRequest;
  /**
   * The user guid of the user whose details will be updated.
   */
  userGUID: string;
}) => {
  return await httpPUTRequest(
    `${
      MANAGE_PROFILE_API.COMPANIES
    }/${getCompanyIdFromSession()}/users/${userGUID}`,
    replaceEmptyValuesWithNull(userInfo),
  );
};
