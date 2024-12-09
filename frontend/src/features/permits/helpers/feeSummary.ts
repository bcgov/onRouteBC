import { PermitHistory } from "../types/PermitHistory";
import { TRANSACTION_TYPES, TransactionType } from "../types/payment";
import { Permit } from "../types/permit";
import { isValidTransaction } from "./payment";
import { Nullable } from "../../../common/types/common";
import { PERMIT_STATES, daysLeftBeforeExpiry, getPermitState } from "./permitState";
import { PERMIT_TYPES, PermitType } from "../types/PermitType";
import { getDurationIntervalDays, maxDurationForPermitType } from "./dateSelection";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../common/helpers/util";

/**
 * Calculates the fee for a permit only by its duration.
 * @param permitType Type of permit
 * @param duration Number of days for duration of permit
 * @returns Fee to be paid for the permit duration
 */
export const calculateFeeByDuration = (permitType: PermitType, duration: number) => {
  const maxAllowableDuration = maxDurationForPermitType(permitType);
  
  // Make sure that duration is between 0 and max allowable duration (for given permit type) 
  const safeDuration = duration < 0
    ? 0
    : (duration > maxAllowableDuration) ? maxAllowableDuration : duration;

  const intervalDays = getDurationIntervalDays(permitType);

  const intervalPeriodsToPay = safeDuration > 360
    ? Math.ceil(360 / intervalDays) : Math.ceil(safeDuration / intervalDays);
  
  switch (permitType) {
    // Add more conditions for other permit types if needed
    case PERMIT_TYPES.STOS:
      // STOS have constant fee of $15 (regardless of duration)
      return 15;
    case PERMIT_TYPES.TROW:
      // Only for TROW, $100 per interval (30 days)
      return intervalPeriodsToPay * 100;
    case PERMIT_TYPES.TROS:
    default:
      // For TROS, $30 per interval (30 days)
      return intervalPeriodsToPay * 30;
  }
};

/**
 * Gets full display text for fee summary.
 * @param feeSummary fee summary field for a permit (if exists)
 * @param duration duration field for a permit (if exists)
 * @param permitType type of permit (if exists)
 * @returns display text for the fee summary (currency amount to 2 decimal places)
 */
export const feeSummaryDisplayText = (
  feeSummary?: Nullable<string>,
  duration?: Nullable<number>,
  permitType?: Nullable<PermitType>,
) => {
  const feeFromSummary = applyWhenNotNullable(
    (numericStr) => Number(numericStr).toFixed(2),
    feeSummary,
  );
  const feeFromDuration = duration && permitType ?
    calculateFeeByDuration(permitType, duration).toFixed(2) : null;
  
  const fee = getDefaultRequiredVal("0.00", feeFromSummary, feeFromDuration);
  const numericFee = Number(fee);
  return numericFee >= 0 ? `$${fee}` : `-$${(numericFee * -1).toFixed(2)}`;
};

/**
 * Determines whether or not the transaction type of a transaction was a refund.
 * @param transactionType Transaction type of a transaction
 * @returns whether or not the transaction type was a refund
 */
export const isTransactionTypeRefund = (transactionType: TransactionType) => {
  return transactionType === TRANSACTION_TYPES.R;
};

/**
 * Calculates the net amount from the history of transactions for a permit.
 * A positive amount represents the net amount that was paid for a permit, and
 * a negative amount represents the net amount that was refunded for a permit, and
 * a 0 amount means that the permit is completely paid with no amount outstanding.
 * @param permitHistory List of history objects that make up the history of a permit
 * @returns total net amount resulting from the history of transactions for the permit
 */
export const calculateNetAmount = (permitHistory: PermitHistory[]) => {
  return permitHistory
    .filter((permit) =>
      isValidTransaction(permit.paymentMethodTypeCode, permit.pgApproved),
    )
    .map((permit) =>
      isTransactionTypeRefund(permit.transactionTypeId)
        ? -1 * permit.transactionAmount
        : permit.transactionAmount,
    )
    .reduce((prev, curr) => prev + curr, 0);
};

/**
 * Calculates the amount that needs to be refunded (or paid if amount is negative) for a permit given a new duration period.
 * @param permitHistory List of history objects that make up the history of a permit and its transactions
 * @param currDuration Current (updated) duration of the permit
 * @param currPermitType Permit type of current permit to refund
 * @returns Amount that needs to be refunded, or if negative then the amount that still needs to be paid
 */
export const calculateAmountToRefund = (
  permitHistory: PermitHistory[],
  currDuration: number,
  currPermitType: PermitType,
) => {
  const netPaid = calculateNetAmount(permitHistory);
  if (isZeroAmount(netPaid)) return 0; // If total paid is $0 (eg. no-fee permits), then refund nothing

  const feeForCurrDuration = calculateFeeByDuration(currPermitType, currDuration);
  return netPaid - feeForCurrDuration;
};

/**
 * Determine whether or not an amount is considered to be zero (due to numerical approximation errors).
 * @param amount Numerical amount (usually representing currency amount)
 * @returns Whether or not the amount is considered to be zero
 */
export const isZeroAmount = (amount: number) => {
  return Math.abs(amount) < 0.000001;
};

/**
 * Calculates the amount that can be refunded for voiding the permit.
 * @param permit Permit to void
 * @param permitHistory List of history objects that make up the history of a permit and its transactions
 * @returns Amount that can be refunded as a result of the void operation
 */
export const calculateAmountForVoid = (
  permit: Permit,
  transactionHistory: PermitHistory[],
) => {
  const permitState = getPermitState(permit);
  if (permitState === PERMIT_STATES.EXPIRED) {
    return 0;
  }

  const netAmountPaid = calculateNetAmount(transactionHistory);
  if (isZeroAmount(netAmountPaid)) return 0; // If existing net paid is $0 (eg. no-fee permits), then refund nothing

  const daysLeft = daysLeftBeforeExpiry(permit);
  const intervalDays = getDurationIntervalDays(permit.permitType);
  return calculateFeeByDuration(
    permit.permitType,
    Math.floor(daysLeft / intervalDays) * intervalDays,
  );
};
