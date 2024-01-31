import { Dayjs } from "dayjs";

import { AllPaymentMethodAndCardTypeCodes } from "../../../../common/types/paymentMethods";

/**
 * The report issued by enum values.
 */
export const REPORT_ISSUED_BY = {
  SELF_ISSUED: "SELF_ISSUED",
  PPC: "PPC",
} as const;

/**
 * The enum type for report issued by.
 */
export type ReportIssuedByType =
  (typeof REPORT_ISSUED_BY)[keyof typeof REPORT_ISSUED_BY];

/**
 * The request object type for payment and refund summary
 */
export type PaymentAndRefundSummaryRequest = {
  issuedBy: ReportIssuedByType[];
  fromDateTime: string;
  toDateTime: string;
};

/**
 * The request object type for payment and refund detail
 */
export interface PaymentAndRefundDetailRequest
  extends PaymentAndRefundSummaryRequest {
  permitType: string[];
  paymentCodes: AllPaymentMethodAndCardTypeCodes[];
  users?: string[];
}

/**
 * The response structure for permit issuers.
 */
export type ReadUserDtoForReport = {
  userGUID: string;
  userName: string;
};

/**
 * The data type for the summary form.
 */
export type PaymentAndRefundSummaryFormData = {
  fromDateTime: Dayjs;
  toDateTime: Dayjs;
  issuedBy: ReportIssuedByType[];
};

/**
 * The data type for the detail form.
 */
export interface PaymentAndRefundDetailFormData
  extends PaymentAndRefundSummaryFormData {
  permitType: string[];
  paymentMethods?: string[];
  users?: string[];
}
