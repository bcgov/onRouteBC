export enum ApplicationStatus {
  APPROVED = 'APPROVED',
  AUTO_APPROVED = 'AUTO_APPROVED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_CART = 'IN_CART',
  REJECTED = 'REJECTED',
  IN_QUEUE = 'IN_QUEUE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PAYMENT_COMPLETE = 'PAYMENT_COMPLETE',
  ISSUED = 'ISSUED',
  SUPERSEDED = 'SUPERSEDED',
  REVOKED = 'REVOKED',
  VOIDED = 'VOIDED',
  DELETED = 'DELETED',
}

/**
 * Application statuses to be considered for Application In Progress (AIP) at time of issuance.
 */
export const ACTIVE_APPLICATION_STATUS_FOR_ISSUANCE: readonly ApplicationStatus[] =
  [
    ApplicationStatus.IN_PROGRESS,
    ApplicationStatus.WAITING_PAYMENT,
    ApplicationStatus.IN_CART,
  ];

/**
 * Application statuses to be considered for Application In Progress (AIP) Tab for All Users.
 */
export const ACTIVE_APPLICATION_STATUS: readonly ApplicationStatus[] = [
  ApplicationStatus.IN_PROGRESS,
  ApplicationStatus.WAITING_PAYMENT,
];

/**
 * Application statuses including Application In Progress (AIP), Pending Permits/Applications & IN_QUEUE
 */
export const ALL_APPLICATION_STATUS: readonly ApplicationStatus[] = [
  ApplicationStatus.IN_PROGRESS,
  ApplicationStatus.WAITING_PAYMENT,
  ApplicationStatus.PAYMENT_COMPLETE,
  ApplicationStatus.IN_QUEUE,
];
