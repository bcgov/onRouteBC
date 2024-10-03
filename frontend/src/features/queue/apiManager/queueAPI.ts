import {
  getCompanyIdFromSession,
  httpPOSTRequest,
} from "../../../common/apiManager/httpRequestHandler";
import { getDefaultRequiredVal } from "../../../common/helpers/util";
import {
  Nullable,
  PaginatedResponse,
  PaginationAndFilters,
} from "../../../common/types/common";
import { getApplications } from "../../permits/apiManager/permitsAPI";
import { ApplicationListItem } from "../../permits/types/application";
import { CaseActivityType } from "../types/CaseActivityType";
import { APPLICATION_QUEUE_API_ROUTES } from "./endpoints/endpoints";

/**
 * Fetch all applications in queue.
 * @return A list of applications in queue (PENDING_REVIEW)
 */
export const getApplicationsInQueue = async (
  paginationFilters: PaginationAndFilters,
  getStaffQueue: boolean,
): Promise<PaginatedResponse<ApplicationListItem>> => {
  return await getApplications(paginationFilters, {
    applicationsInQueueOnly: true,
    getStaffQueue,
  });
};

/**
 * Fetch all claimed applications in queue.
 * @return A list of claimed applications in queue (IN_REVIEW)
 */
export const getClaimedApplicationsInQueue = async (
  paginationFilters: PaginationAndFilters,
): Promise<PaginatedResponse<ApplicationListItem>> => {
  return await getApplications(paginationFilters, {
    getStaffQueue: true,
    claimedApplicationsOnly: true,
  });
};

/**
 * Fetch all unclaimed applications in queue.
 * @return A list of claimed applications in queue (PENDING_REVIEW)
 */
export const getUnclaimedApplicationsInQueue = async (
  paginationFilters: PaginationAndFilters,
): Promise<PaginatedResponse<ApplicationListItem>> => {
  return await getApplications(paginationFilters, {
    getStaffQueue: true,
    unclaimedApplicationsOnly: true,
  });
};

/**
 * Get queued application by application number
 * @param applicationNumber Application number of the queued application to be retrieved.
 * @returns Application information if found, or undefined
 */
export const getApplicationInQueueDetails = async (
  applicationNumber: string,
): Promise<ApplicationListItem> => {
  // TODO remove this function and replace its usage with useApplicationDetailsQuery once that has been refactored
  const applicationsList = await getApplications(
    {
      page: 0,
      take: 1,
      searchString: applicationNumber,
      searchColumn: "applicationNumber",
    },
    { claimedApplicationsOnly: true, getStaffQueue: true },
  );
  return applicationsList.items[0];
};

export const updateApplicationQueueStatus = async ({
  applicationId,
  caseActivityType,
  companyId,
  comment,
}: {
  applicationId: Nullable<string>;
  caseActivityType: CaseActivityType;
  companyId?: number;
  comment?: string;
}) => {
  companyId = getDefaultRequiredVal(
    0,
    companyId,
    Number(getCompanyIdFromSession()),
  );
  applicationId = getDefaultRequiredVal("", applicationId);

  const data: any = {
    caseActivityType,
  };

  // Conditionally include the comment property if it is given as an argument and not an empty string
  if (comment && comment.trim() !== "") {
    data.comment = [comment];
  }

  const response = await httpPOSTRequest(
    APPLICATION_QUEUE_API_ROUTES.UPDATE_QUEUE_STATUS(companyId, applicationId),
    data,
  );
  return response;
};

export const claimApplicationInQueue = async (
  companyId: Nullable<number>,
  applicationId: Nullable<string>,
) => {
  companyId = getDefaultRequiredVal(0, companyId);
  applicationId = getDefaultRequiredVal("", applicationId);
  const response = await httpPOSTRequest(
    APPLICATION_QUEUE_API_ROUTES.CLAIM(companyId, applicationId),
    {},
  );
  return response;
};
