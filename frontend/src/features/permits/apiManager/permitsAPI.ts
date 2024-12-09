import { AxiosResponse } from "axios";

import { PermitHistory } from "../types/PermitHistory";
import { removeEmptyIdsFromPermitsActionResponse } from "../helpers/mappers";
import { AmendPermitFormData } from "../pages/Amend/types/AmendPermitFormData";
import { DATE_FORMATS, toLocal } from "../../../common/helpers/formatDate";
import { EmailNotificationType } from "../types/EmailNotificationType";
import { APPLICATION_QUEUE_STATUSES } from "../../queue/types/ApplicationQueueStatus";
import {
  IssuePermitsResponse,
  PermitListItem,
  PermitResponseData,
} from "../types/permit";

import {
  Nullable,
  PaginatedResponse,
  PaginationAndFilters,
  RequiredOrNull,
} from "../../../common/types/common";

import {
  serializeForCreateApplication,
  serializeForUpdateApplication,
} from "../helpers/serialize/serializeApplication";

import {
  CompleteTransactionRequestData,
  CompleteTransactionResponseData,
  StartTransactionRequestData,
  StartTransactionResponseData,
} from "../types/payment";

import {
  httpGETRequest,
  httpPUTRequest,
  httpPOSTRequest,
  httpGETRequestStream,
  httpDELETERequest,
} from "../../../common/apiManager/httpRequestHandler";

import {
  getDefaultRequiredVal,
  replaceEmptyValuesWithNull,
  streamDownloadFile,
  stringifyOrderBy,
} from "../../../common/helpers/util";

import {
  ApplicationResponseData,
  ApplicationListItem,
  ApplicationFilters,
  ApplicationFormData,
} from "../types/application";

import {
  APPLICATIONS_API_ROUTES,
  PAYMENT_API_ROUTES,
  PERMITS_API_ROUTES,
  STAFF_APPLICATIONS_API_ROUTES,
} from "./endpoints/endpoints";

import {
  RevokePermitRequestData,
  VoidPermitRequestData,
  VoidPermitResponseData,
} from "../pages/Void/types/VoidPermit";

/**
 * Create a new application.
 * @param applicationFormData Application form data to be submitted
 * @returns Response with created application, or error if failed
 */
export const createApplication = async (
  applicationFormData: ApplicationFormData,
  companyId: number,
): Promise<AxiosResponse<ApplicationResponseData>> => {
  return await httpPOSTRequest(
    APPLICATIONS_API_ROUTES.CREATE(companyId),
    replaceEmptyValuesWithNull(
      serializeForCreateApplication(applicationFormData),
    ),
  );
};

/**
 * Update an existing application.
 * @param applicationFormData Application form data
 * @param applicationId Application id for the application to update
 * @param companyId Company id that the application belongs to
 * @returns Response with updated application, or error if failed
 */
export const updateApplication = async (
  application: ApplicationFormData,
  applicationId: string,
  companyId: number,
): Promise<AxiosResponse<ApplicationResponseData>> => {
  return await httpPUTRequest(
    APPLICATIONS_API_ROUTES.UPDATE(companyId, applicationId),
    replaceEmptyValuesWithNull(
      serializeForUpdateApplication(application),
    ),
  );
};

export const getApplications = async (
  {
    page = 0,
    take = 10,
    searchString = "",
    orderBy = [],
    searchColumn = "",
  }: PaginationAndFilters,
  {
    pendingPermitsOnly,
    applicationsInQueueOnly,
    claimedApplicationsOnly,
    unclaimedApplicationsOnly,
    getStaffQueue,
  }: ApplicationFilters,
  companyId?: Nullable<number>,
): Promise<PaginatedResponse<ApplicationListItem>> => {
  // If the user is staff and not acting as a company, get timeInQueue and claimedBy properties 
  // in addition to the ApplicationListItem response to be used in the ApplicationsInQueueList component
  const applicationsURL = !getStaffQueue && companyId
    ? new URL(APPLICATIONS_API_ROUTES.GET_APPLICATIONS(companyId))
    : new URL(STAFF_APPLICATIONS_API_ROUTES.GET());

  // API pagination index starts at 1. Hence page + 1.
  applicationsURL.searchParams.set("page", `${page + 1}`);
  applicationsURL.searchParams.set("take", `${take}`);

  if (typeof pendingPermitsOnly !== "undefined") {
    applicationsURL.searchParams.set(
      "pendingPermits",
      `${Boolean(pendingPermitsOnly)}`,
    );
  }

  if (typeof applicationsInQueueOnly !== "undefined") {
    applicationsURL.searchParams.set(
      "applicationQueueStatus",
      `${APPLICATION_QUEUE_STATUSES.PENDING_REVIEW},${APPLICATION_QUEUE_STATUSES.IN_REVIEW}`,
    );
  }

  if (typeof claimedApplicationsOnly !== "undefined") {
    applicationsURL.searchParams.set(
      "applicationQueueStatus",
      `${APPLICATION_QUEUE_STATUSES.IN_REVIEW}`,
    );
  }

  if (typeof unclaimedApplicationsOnly !== "undefined") {
    applicationsURL.searchParams.set(
      "applicationQueueStatus",
      `${APPLICATION_QUEUE_STATUSES.PENDING_REVIEW}`,
    );
  }

  if (searchString) {
    applicationsURL.searchParams.set("searchString", searchString);
  }

  if (orderBy.length > 0) {
    applicationsURL.searchParams.set("orderBy", stringifyOrderBy(orderBy));
  }

  if (searchColumn.length > 0) {
    applicationsURL.searchParams.set("searchColumn", searchColumn);
  }

  const applications = await httpGETRequest(applicationsURL.toString())
    .then((response) => {
      const paginatedResponseObject = getDefaultRequiredVal(
        {},
        response.data,
      ) as PaginatedResponse<ApplicationListItem>;
      return paginatedResponseObject;
    })
    .then((paginatedApplications: PaginatedResponse<ApplicationListItem>) => {
      const applicationsWithDateTransformations =
        paginatedApplications.items.map((application) => {
          return {
            ...application,
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
              true,
            ),
          } as ApplicationListItem;
        });
      return {
        ...paginatedApplications,
        items: applicationsWithDateTransformations,
      };
    });

  return applications;
};

/**
 * Fetch all applications in progress.
 * @return A list of applications in the IN_PROGRESS and WAITING_PAYMENT statuses
 */
export const getApplicationsInProgress = async (
  companyId: number,
  paginationFilters: PaginationAndFilters,
): Promise<PaginatedResponse<ApplicationListItem>> => {
  return await getApplications(
    paginationFilters,
    { pendingPermitsOnly: false },
    companyId,
  );
};

/**
 * Fetch all pending permits.
 * @return A list of pending permits in the PAYMENT_COMPLETE status
 */
export const getPendingPermits = async (
  companyId: number,
  paginationFilters: PaginationAndFilters,
): Promise<PaginatedResponse<ApplicationListItem>> => {
  return await getApplications(
    paginationFilters,
    { pendingPermitsOnly: true },
    companyId,
  );
};

/**
 * Fetch application by its permit id.
 * @param companyId company id of the company who owns the application
 * @param permitId permit id of the application to fetch
 * @returns ApplicationResponseData data as response, or null if fetch failed
 */
export const getApplication = async (
  companyId: number,
  permitId: string,
): Promise<RequiredOrNull<ApplicationResponseData>> => {
  try {
    const url = APPLICATIONS_API_ROUTES.GET(companyId, permitId);
    const response = await httpGETRequest(url);
    return response.data;
  } catch (err) {
    return null;
  }
};

/**
 * Delete one or more applications.
 * @param companyId id of the company to delete the applications from
 * @param applicationIds List of permit ids of the applications to be deleted
 * @returns A Promise with the API response.
 */
export const deleteApplications = async (
  companyId: number,
  applicationIds: string[],
) => {
  const requestBody = {
    applications: applicationIds,
  };
  
  return await httpDELETERequest(
    `${APPLICATIONS_API_ROUTES.DELETE(companyId)}`,
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
 * @param companyId id of the company that the application belongs to
 * @param permitId permit id of the permit application
 * @returns A Promise of dms reference string
 */
export const downloadPermitApplicationPdf = async (
  companyId: number,
  permitId: string,
) => {
  const url = PERMITS_API_ROUTES.DOWNLOAD(companyId, permitId);
  return await streamDownload(url);
};

/**
 * Download permit receipt pdf file.
 * @param companyId id of the company that the receipt belongs to
 * @param permitId permit id of the permit application associated with the receipt
 * @returns A Promise of dms reference string
 */
export const downloadReceiptPdf = async (
  companyId: number,
  permitId: string,
) => {
  const url = PERMITS_API_ROUTES.RECEIPT(companyId, permitId);
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
 * @param companyId id of the company to issue permits for
 * @param applicationIds Application/permit ids for the permits to be issued
 * @returns Successful and failed permit ids that were issued
 */
export const issuePermits = async (
  companyId: number,
  applicationIds: string[],
): Promise<IssuePermitsResponse> => {
  try {
    const response = await httpPOSTRequest(
      PERMITS_API_ROUTES.ISSUE(companyId),
      replaceEmptyValuesWithNull({
        applicationIds,
      }),
    );

    if (response.status !== 201 || !response.data) {
      return removeEmptyIdsFromPermitsActionResponse({
        success: [],
        failure: [...applicationIds],
      });
    }

    return removeEmptyIdsFromPermitsActionResponse(
      response.data as IssuePermitsResponse,
    );
  } catch (err) {
    console.error(err);
    return removeEmptyIdsFromPermitsActionResponse({
      success: [],
      failure: [...applicationIds],
    });
  }
};

/**
 * Get permit details.
 * @param companyId id of the company that the permit belongs to
 * @param permitId Permit id of the permit to be retrieved.
 * @returns Permit information if found, or undefined
 */
export const getPermit = async (
  companyId: number,
  permitId: string,
): Promise<RequiredOrNull<PermitResponseData>> => {
  if (!companyId || !permitId) return null;

  const permitsURL = `${PERMITS_API_ROUTES.GET(companyId)}/${permitId}`;

  const response = await httpGETRequest(permitsURL);
  if (!response.data) return null;
  return response.data as PermitResponseData;
};

/**
 * Get current application for amendment, if there is one.
 * @param companyId id of the company that the original permit belongs to
 * @param originalId Original permit id of the permit that is amended
 * @returns Current amendment application information, if any
 */
export const getCurrentAmendmentApplication = async (
  companyId: number,
  originalId: string,
): Promise<RequiredOrNull<ApplicationResponseData>> => {
  if (!companyId || !originalId) return null;

  const permitsURL = new URL(
    APPLICATIONS_API_ROUTES.GET(companyId, originalId),
  );
  permitsURL.searchParams.set("amendment", "true");

  try {
    const response = await httpGETRequest(permitsURL.toString());
    if (!response.data) return null;
    return response.data as ApplicationResponseData;
  } catch (err) {
    return null;
  }
};

/**
 * Retrieve the list of active or expired permits.
 * @param companyId id of the company to get permits for
 * @param expired If set to true, expired permits will be retrieved
 * @param paginationOptions The pagination and filters applied
 * @returns A list of permits
 */
export const getPermits = async (
  companyId: number,
  { expired = false } = {},
  { page = 0, take = 10, searchString, orderBy = [] }: PaginationAndFilters,
): Promise<PaginatedResponse<PermitListItem>> => {
  const permitsURL = new URL(PERMITS_API_ROUTES.GET(companyId));

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
              true,
            ),
            expiryDate: toLocal(
              permit.expiryDate,
              DATE_FORMATS.DATEONLY_SHORT_NAME,
              true,
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

export const getPermitHistory = async (
  companyId: number,
  originalPermitId: string,
) => {
  try {
    if (!companyId || !originalPermitId) return [];

    const response = await httpGETRequest(
      `${PERMITS_API_ROUTES.BASE(companyId)}/${originalPermitId}/history`,
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
      `${PERMITS_API_ROUTES.VOID(permitId)}`,
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
 * @param companyId id of the company that the permit belongs to
 * @returns Response with amended permit application, or error if failed
 */
export const amendPermit = async (
  formData: AmendPermitFormData,
  companyId: number,
): Promise<AxiosResponse<ApplicationResponseData>> => {
  return await httpPOSTRequest(
    PERMITS_API_ROUTES.AMEND(companyId),
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
 * @param companyId id of the company that the amendment application belongs to
 * @returns response with amended permit data, or error if failed
 */
export const modifyAmendmentApplication = async ({
  application,
  applicationId,
  companyId,
}: {
  application: AmendPermitFormData;
  applicationId: string;
  companyId: number;
}) => {
  return await updateApplication(application, applicationId, companyId);
};

/**
 * Resend permit and/or receipt to email.
 * @param permitId Permit id of the permit to resend
 * @param email Email to resend to
 * @param fax Fax number to resend to
 * @param notificationTypes Types of email notifications to send (EMAIL_PERMIT and/or EMAIL_RECEIPT)
 * @returns Response if the resend action was successful
 */
export const resendPermit = async ({
  permitId,
  email,
  fax,
  notificationTypes,
}: {
  permitId: string;
  email: string;
  fax?: string;
  notificationTypes: EmailNotificationType[];
}) => {
  const data: any = {
    to: [email],
    notificationType: [...notificationTypes],
  };

  // Conditionally include the fax property if it is not an empty string
  if (fax && fax.trim() !== "") {
    data.fax = [fax];
  }

  return await httpPOSTRequest(
    `${PERMITS_API_ROUTES.RESEND(permitId)}`,
    replaceEmptyValuesWithNull(data),
  );
};
