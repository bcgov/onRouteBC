export const CaseStatusType = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  IN_PROGRESS: 'IN_PROGRESS',
} as const;

export type CaseStatusType =
  (typeof CaseStatusType)[keyof typeof CaseStatusType];

export const ApplicationQueueStatus = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  IN_REVIEW: 'IN_REVIEW',
  CLOSED: 'CLOSED',
} as const;

export type ApplicationQueueStatus =
  (typeof ApplicationQueueStatus)[keyof typeof ApplicationQueueStatus];

export const ACTIVE_APPLICATION_QUEUE_STATUS: readonly ApplicationQueueStatus[] =
  [ApplicationQueueStatus.PENDING_REVIEW, ApplicationQueueStatus.IN_REVIEW];

const statusMapping: Record<ApplicationQueueStatus, CaseStatusType> = {
  [ApplicationQueueStatus.PENDING_REVIEW]: CaseStatusType.OPEN,
  [ApplicationQueueStatus.IN_REVIEW]: CaseStatusType.IN_PROGRESS,
  [ApplicationQueueStatus.CLOSED]: CaseStatusType.CLOSED,
};

/**
 * Converts an ApplicationQueueStatus to its corresponding CaseStatusType.
 *
 * @param status The ApplicationQueueStatus to convert.
 * @returns The corresponding CaseStatusType.
 */
export const convertApplicationQueueStatus = (
  statuses: ApplicationQueueStatus[],
): CaseStatusType[] => {
  return statuses?.map((status) => statusMapping[status]);
};

const reverseStatusMapping: Record<CaseStatusType, ApplicationQueueStatus> = {
  [CaseStatusType.OPEN]: ApplicationQueueStatus.PENDING_REVIEW,
  [CaseStatusType.CLOSED]: ApplicationQueueStatus.CLOSED,
  [CaseStatusType.IN_PROGRESS]: ApplicationQueueStatus.IN_REVIEW,
};

/**
 * Converts an array of CaseStatusType values to their corresponding ApplicationQueueStatus values.
 *
 * @param statuses An array of CaseStatusType values to convert.
 * @returns An array of ApplicationQueueStatus values
 */
export const convertCaseStatus = (
  statuses: CaseStatusType[],
): ApplicationQueueStatus[] => {
  return statuses.map((status) => reverseStatusMapping[status]);
};
