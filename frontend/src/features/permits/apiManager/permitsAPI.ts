import { AxiosResponse } from "axios";

import { DATE_FORMATS, toLocal } from "../../../common/helpers/formatDate";
import { IssuePermitsResponse, PermitListItem, PermitResponseData } from "../types/permit";
import { PermitHistory } from "../types/PermitHistory";
import { getPermitTypeName } from "../types/PermitType";
import { removeEmptyIdsFromPermitsActionResponse } from "../helpers/mappers";
import { AmendPermitFormData } from "../pages/Amend/types/AmendPermitFormData";
import {
  Nullable,
  PaginatedResponse,
  PaginationAndFilters,
  RequiredOrNull,
} from "../../../common/types/common";

import {
  serializeForCreateApplication,
  serializeForUpdateApplication,
} from "../helpers/serializeApplication";

import {
  CompleteTransactionRequestData,
  CompleteTransactionResponseData,
  StartTransactionRequestData,
  StartTransactionResponseData,
} from "../types/payment";

import {
  getCompanyIdFromSession,
  httpGETRequest,
  httpPUTRequest,
  httpPOSTRequest,
  httpGETRequestStream,
  httpDELETERequest,
} from "../../../common/apiManager/httpRequestHandler";

import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
  replaceEmptyValuesWithNull,
  streamDownloadFile,
  stringifyOrderBy,
} from "../../../common/helpers/util";

import {
  ApplicationResponseData,
  ApplicationListItem,
  ApplicationFormData,
} from "../types/application";

import {
  APPLICATIONS_API_ROUTES,
  PAYMENT_API_ROUTES,
  PERMITS_API_ROUTES,
} from "./endpoints/endpoints";

import {
  RevokePermitRequestData,
  VoidPermitRequestData,
  VoidPermitResponseData,
} from "../pages/Void/types/VoidPermit";

/**
 * Create a new application.
 * @param application application data to be submitted
 * @returns response with created application data, or error if failed
 */
export const createApplication = async (
  application: ApplicationFormData,
): Promise<AxiosResponse<ApplicationResponseData>> => {
  return await httpPOSTRequest(
    APPLICATIONS_API_ROUTES.CREATE,
    replaceEmptyValuesWithNull({
      // must convert application to ApplicationRequestData (dayjs fields to strings)
      ...serializeForCreateApplication(application),
    }),
  );
};

/**
 * Update an existing application.
 * @param application application data
 * @param applicationNumber application number for the application to update
 * @returns response with updated application data, or error if failed
 */
export const updateApplication = async (
  application: ApplicationFormData,
  applicationNumber: string,
): Promise<AxiosResponse<ApplicationResponseData>> => {
  return await httpPUTRequest(
    `${APPLICATIONS_API_ROUTES.UPDATE}/${applicationNumber}`,
    replaceEmptyValuesWithNull({
      // must convert application to ApplicationRequestData (dayjs fields to strings)
      ...serializeForUpdateApplication(application),
    }),
  );
};

/**
 * Fetch All Permit Application in Progress
 * @return An array of permit applications
 */
export const getApplicationsInProgress = async ({
  page = 0,
  take = 10,
  searchString,
  orderBy = [],
}: PaginationAndFilters): Promise<
  PaginatedResponse<ApplicationListItem>
> => {
  const companyId = getCompanyIdFromSession();
  const applicationsURL = new URL(APPLICATIONS_API_ROUTES.GET);
  if (companyId) {
    applicationsURL.searchParams.set("companyId", companyId);
  }

  // API pagination index starts at 1. Hence page + 1.
  applicationsURL.searchParams.set("page", (page + 1).toString());
  applicationsURL.searchParams.set("take", take.toString());
  if (searchString) {
    applicationsURL.searchParams.set("searchString", searchString);
  }
  if (orderBy?.length > 0) {
    applicationsURL.searchParams.set("orderBy", stringifyOrderBy(orderBy));
  }

  const applications = await httpGETRequest(applicationsURL.toString())
    .then((response) => {
      const paginatedResponseObject = getDefaultRequiredVal(
        {},
        response.data,
      ) as PaginatedResponse<ApplicationListItem>;
      return paginatedResponseObject;
    })
    .then(
      (
        paginatedApplications: PaginatedResponse<ApplicationListItem>,
      ) => {
        const applicationsWithDateTransformations =
          paginatedApplications.items.map((application) => {
            return {
              ...application,
              permitType: getPermitTypeName(application.permitType) as string,
              createdDateTime: toLocal(
                application?.createdDateTime,
                DATE_FORMATS.DATETIME_LONG_TZ,
              ),
              updatedDateTime: toLocal(
                application?.updatedDateTime,
                DATE_FORMATS.DATETIME_LONG_TZ,
              ),
              startDate: toLocal(
                application?.startDate,
                DATE_FORMATS.DATEONLY_SHORT_NAME,
              ),
            } as ApplicationListItem;
          });
        return {
          ...paginatedApplications,
          items: applicationsWithDateTransformations,
        };
      },
    );

  return applications;
};

/**
 * Fetch application by its permit id.
 * @param permitId permit id of the application to fetch
 * @returns ApplicationResponseData data as response, or null if fetch failed
 */
export const getApplicationByPermitId = async (
  permitId?: string,
): Promise<RequiredOrNull<ApplicationResponseData>> => {
  try {
    const companyId = getCompanyIdFromSession();
    let url = `${APPLICATIONS_API_ROUTES.GET}/${permitId}`;
    if (companyId) {
      url += `?companyId=${companyId}`;
    }

    const response = await httpGETRequest(url);
    return response.data;
  } catch (err) {
    return null;
  }
};

/**
 * Delete one or more applications.
 * @param permitIds Array of permit ids to be deleted.
 * @returns A Promise with the API response.
 */
export const deleteApplications = async (applicationIds: Array<string>) => {
  const requestBody = {
    applications: applicationIds,
    companyId: Number(getCompanyIdFromSession()),
  };

  return await httpDELETERequest(
    `${APPLICATIONS_API_ROUTES.DELETE}`,
    replaceEmptyValuesWithNull(requestBody),
  );
};

const streamDownload = async (url: string) => {
  const response = await httpGETRequestStream(url);
  const file = await streamDownloadFile(response);
  return file;
};

/**
 * Download permit application pdf file.
 * @param permitId permit id of the permit application.
 * @returns A Promise of dms reference string.
 */
export const downloadPermitApplicationPdf = async (permitId: string) => {
  const url = `${PERMITS_API_ROUTES.BASE}/${permitId}/${PERMITS_API_ROUTES.DOWNLOAD}`;
  return await streamDownload(url);
};

/**
 * Download permit receipt pdf file.
 * @param permitId permit id of the permit application associated with the receipt.
 * @returns A Promise of dms reference string.
 */
export const downloadReceiptPdf = async (permitId: string) => {
  const url = `${PERMITS_API_ROUTES.BASE}/${permitId}/${PERMITS_API_ROUTES.RECEIPT}`;
  return await streamDownload(url);
};

/**
 * Start making a payment transaction with Moti Pay.
 * @param {StartTransactionRequestData} requestData - Payment information that is to be submitted.
 * @returns {Promise<StartTransactionResponseData>} - A Promise that resolves to the submitted transaction with URL.
 */
export const startTransaction = async (
  requestData: StartTransactionRequestData,
): Promise<RequiredOrNull<StartTransactionResponseData>> => {
  try {
    const response = await httpPOSTRequest(
      PAYMENT_API_ROUTES.START,
      replaceEmptyValuesWithNull(requestData),
    );
    if (response.status !== 201) {
      return null;
    }
    return response.data as StartTransactionResponseData;
  } catch (err) {
    console.error(err);
    return null;
  }
};

/**
 * Completes the transaction after payment is successful.
 * @param transactionId - The id for the transaction to be completed
 * @param transactionQueryString - the queryString with the hashValue to be validated
 * @param transactionDetails - The complete transaction details to be submitted after payment
 * @returns Promise that resolves to a successful transaction.
 */
export const completeTransaction = async (transactionData: {
  transactionId: string;
  transactionQueryString: string;
  transactionDetails: CompleteTransactionRequestData;
}): Promise<RequiredOrNull<CompleteTransactionResponseData>> => {
  try {
    const { transactionId, transactionDetails, transactionQueryString } =
      transactionData;

    const response = await httpPUTRequest(
      `${PAYMENT_API_ROUTES.COMPLETE}/${transactionId}/${PAYMENT_API_ROUTES.PAYMENT_GATEWAY}?queryString=${transactionQueryString}`,
      transactionDetails,
    );
    if (response.status !== 200) {
      return null;
    }
    return response.data as CompleteTransactionResponseData;
  } catch (err) {
    console.error(err);
    return null;
  }
};

/**
 * Issues the permits indicated by the application/permit ids.
 * @param ids Application/permit ids for the permits to be issued.
 * @returns Successful and failed permit ids that were issued.
 */
export const issuePermits = async (
  ids: string[],
): Promise<IssuePermitsResponse> => {
  try {
    const companyId = getCompanyIdFromSession();
    const response = await httpPOSTRequest(
      PERMITS_API_ROUTES.ISSUE,
      replaceEmptyValuesWithNull({
        applicationIds: [...ids],
        companyId: applyWhenNotNullable(
          (companyId) => Number(companyId),
          companyId,
        ),
      }),
    );

    if (response.status !== 201 || !response.data) {
      return removeEmptyIdsFromPermitsActionResponse({
        success: [],
        failure: [...ids],
      });
    }

    return removeEmptyIdsFromPermitsActionResponse(
      response.data as IssuePermitsResponse,
    );
  } catch (err) {
    console.error(err);
    return removeEmptyIdsFromPermitsActionResponse({
      success: [],
      failure: [...ids],
    });
  }
};

/**
 * Get permit by permit id
 * @param permitId Permit id of the permit to be retrieved.
 * @returns Permit information if found, or undefined
 */
export const getPermit = async (
  permitId?: Nullable<string>,
): Promise<RequiredOrNull<PermitResponseData>> => {
  if (!permitId) return null;

  const companyId = getDefaultRequiredVal("", getCompanyIdFromSession());
  let permitsURL = `${PERMITS_API_ROUTES.GET}/${permitId}`;
  const queryParams = [];
  if (companyId) {
    queryParams.push(`companyId=${companyId}`);
  }

  if (queryParams.length > 0) {
    permitsURL += `?${queryParams.join("&")}`;
  }

  const response = await httpGETRequest(permitsURL);
  if (!response.data) return null;
  return response.data as PermitResponseData;
};

/**
 * Get current application for amendment, if there is one
 * @param originalId Original permit id of the permit that is amended.
 * @returns Permit application information, if any
 */
export const getCurrentAmendmentApplication = async (
  originalId?: Nullable<string>,
): Promise<RequiredOrNull<ApplicationResponseData>> => {
  if (!originalId) return null;
  const companyId = getDefaultRequiredVal("", getCompanyIdFromSession());
  let permitsURL = `${APPLICATIONS_API_ROUTES.GET}/${originalId}`;
  const queryParams = [`amendment=true`];
  if (companyId) {
    queryParams.push(`companyId=${companyId}`);
  }
  if (queryParams.length > 0) {
    permitsURL += `?${queryParams.join("&")}`;
  }

  try {
    const response = await httpGETRequest(permitsURL);
    if (!response.data) return null;
    return response.data as ApplicationResponseData;
  } catch (err) {
    return null;
  }
};

/**
 * Retrieve the list of active or expired permits.
 * @param expired If set to true, expired permits will be retrieved.
 * @param paginationOptions The pagination and filters applied.
 * @returns A list of permits.
 */
export const getPermits = async (
  { expired = false } = {},
  { page = 0, take = 10, searchString, orderBy = [] }: PaginationAndFilters,
): Promise<PaginatedResponse<PermitListItem>> => {
  const companyId = getDefaultRequiredVal("", getCompanyIdFromSession());
  const permitsURL = new URL(PERMITS_API_ROUTES.GET);
  if (companyId) {
    permitsURL.searchParams.set("companyId", companyId);
  }
  permitsURL.searchParams.set("expired", expired.toString());
  // API pagination index starts at 1. Hence page + 1.
  permitsURL.searchParams.set("page", (page + 1).toString());
  permitsURL.searchParams.set("take", take.toString());
  if (searchString) {
    permitsURL.searchParams.set("searchString", searchString);
  }
  if (orderBy.length > 0) {
    permitsURL.searchParams.set("orderBy", stringifyOrderBy(orderBy));
  }
  const permits = await httpGETRequest(permitsURL.toString())
    .then((response) => {
      const paginatedResponseObject = getDefaultRequiredVal(
        {},
        response.data,
      ) as PaginatedResponse<PermitListItem>;
      return paginatedResponseObject;
    })
    .then((paginatedPermits: PaginatedResponse<PermitListItem>) => {
      const permitsWithDateTransformations = paginatedPermits.items.map(
        (permit) => {
          return {
            ...permit,
            createdDateTime: toLocal(
              permit.createdDateTime,
              DATE_FORMATS.DATETIME_LONG_TZ,
            ),
            updatedDateTime: toLocal(
              permit.updatedDateTime,
              DATE_FORMATS.DATETIME_LONG_TZ,
            ),
            startDate: toLocal(
              permit.startDate,
              DATE_FORMATS.DATEONLY_SHORT_NAME,
            ),
            expiryDate: toLocal(
              permit.expiryDate,
              DATE_FORMATS.DATEONLY_SHORT_NAME,
            ),
          } as PermitListItem;
        },
      );
      return {
        ...paginatedPermits,
        items: permitsWithDateTransformations,
      };
    });
  return permits;
};

export const getPermitHistory = async (originalPermitId?: Nullable<string>) => {
  try {
    if (!originalPermitId) return [];

    const response = await httpGETRequest(
      `${PERMITS_API_ROUTES.BASE}/${originalPermitId}/history`,
    );

    if (response.status === 200) {
      return response.data as PermitHistory[];
    }
    return [];
  } catch (err) {
    return [];
  }
};

/**
 * Void or revoke a permit.
 * @param permitId Id of the permit to void or revoke.
 * @param voidData Void or revoke data to be sent to backend.
 * @returns Response data containing successfully voided/revoked permit ids, as well as failed ones.
 */
export const voidPermit = async (voidPermitParams: {
  permitId: string;
  voidData: VoidPermitRequestData | RevokePermitRequestData;
}) => {
  const { permitId, voidData } = voidPermitParams;
  try {
    const response = await httpPOSTRequest(
      `${PERMITS_API_ROUTES.BASE}/${permitId}/${PERMITS_API_ROUTES.VOID}`,
      replaceEmptyValuesWithNull(voidData),
    );

    if (response.status === 201 && response.data) {
      return removeEmptyIdsFromPermitsActionResponse(
        response.data as VoidPermitResponseData,
      );
    }

    return removeEmptyIdsFromPermitsActionResponse({
      success: [],
      failure: [permitId],
    });
  } catch (err) {
    console.error(err);
    return removeEmptyIdsFromPermitsActionResponse({
      success: [],
      failure: [permitId],
    });
  }
};

/**
 * Amend a permit.
 * @param formData data for permit to be amended
 * @returns Response with amended permit application, or error if failed
 */
export const amendPermit = async (
  formData: AmendPermitFormData
): Promise<AxiosResponse<ApplicationResponseData>> => {
  return await httpPOSTRequest(
    PERMITS_API_ROUTES.AMEND,
    replaceEmptyValuesWithNull({
      // must convert application to ApplicationRequestData (dayjs fields to strings)
    ...serializeForCreateApplication(formData),
    }),
  );
};

/**
 * Modify amendment application.
 * @param application amendment application data to be modified
 * @param applicationNumber application number of the amendment application
 * @returns response with amended permit data, or error if failed
 */
export const modifyAmendmentApplication = async ({
  application,
  applicationNumber,
}: {
  application: AmendPermitFormData;
  applicationNumber: string;
}) => {
  return await updateApplication(application, applicationNumber);
};
