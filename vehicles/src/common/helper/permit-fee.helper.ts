import { TransactionType } from '../enum/transaction-type.enum';
import { PermitHistoryDto } from 'src/modules/permit-application-payment/permit/dto/response/permit-history.dto';
import { BadRequestException, NotAcceptableException } from '@nestjs/common';
import { Permit } from 'src/modules/permit-application-payment/permit/entities/permit.entity';
import { PermitType } from '../enum/permit-type.enum';
import {
  TROS_MAX_VALID_DURATION,
  TROS_MIN_VALID_DURATION,
  TROS_PRICE_PER_TERM,
  TROS_TERM,
  TROW_MAX_VALID_DURATION,
  TROW_MIN_VALID_DURATION,
  TROW_PRICE_PER_TERM,
  TROW_TERM,
} from '../constants/permit.constant';
import { differenceBetween } from './date-time.helper';
import * as dayjs from 'dayjs';
import { ApplicationStatus } from '../enum/application-status.enum';
import { Nullable } from '../types/common';

/**
 * Calculates the permit fee based on the application and old amount.
 * @param application The permit application.
 * @param oldAmount The old amount of the permit.
 * @returns The calculated permit fee.
 * @throws {NotAcceptableException} If the duration is invalid for TROS permit type.
 * @throws {BadRequestException} If the permit type is not recognized.
 */
export const permitFee = (
  application: Permit,
  isNoFee?: Nullable<boolean>,
  oldAmount?: Nullable<number>,
): number => {
  let duration = calculateDuration(application);
  switch (application.permitType) {
    case PermitType.TERM_OVERSIZE: {
      const validDuration = isValidDuration(
        duration,
        TROS_MIN_VALID_DURATION,
        TROS_MAX_VALID_DURATION,
      );
      if (!validDuration) {
        throw new BadRequestException(
          `Invalid duration (${duration} days) for ${application.permitType} permit type.`,
        );
      }
      // Adjusting duration for one year term permit
      if (yearlyPermit(duration)) duration = 360;
      if (
        leapYear(
          duration,
          application.permitData.startDate,
          application.permitData.expiryDate,
        )
      )
        duration = 360;
      return currentPermitFee(
        duration,
        TROS_PRICE_PER_TERM,
        TROS_TERM,
        oldAmount,
        application.permitStatus,
        isNoFee,
      );
    }
    case PermitType.TERM_OVERWEIGHT: {
      const validDuration = isValidDuration(
        duration,
        TROW_MIN_VALID_DURATION,
        TROW_MAX_VALID_DURATION,
      );
      if (!validDuration) {
        throw new BadRequestException(
          `Invalid duration (${duration} days) for ${application.permitType} permit type.`,
        );
      }
      // Adjusting duration for one year term permit
      if (yearlyPermit(duration)) duration = 360;
      if (
        leapYear(
          duration,
          application.permitData.startDate,
          application.permitData.expiryDate,
        )
      )
        duration = 360;
      return currentPermitFee(
        duration,
        TROW_PRICE_PER_TERM,
        TROW_TERM,
        oldAmount,
        application.permitStatus,
        isNoFee,
      );
    }
    default:
      throw new BadRequestException(
        `Invalid permit type: ${application.permitType}`,
      );
  }
};

export const yearlyPermit = (duration: number): boolean => {
  return duration <= 365 && duration >= 361;
};

export const calculateDuration = (application: Permit): number => {
  let startDate = application.permitData.startDate;
  const endDate = application.permitData.expiryDate;
  const today = dayjs(new Date()).format('YYYY-MM-DD');
  if (
    application.permitStatus === ApplicationStatus.VOIDED &&
    startDate < today
  )
    startDate = today;
  if (
    application.permitStatus === ApplicationStatus.VOIDED &&
    today === startDate
  )
    startDate = dayjs(today).add(1, 'day').format('YYYY-MM-DD');
  const duration = differenceBetween(startDate, endDate) + 1;
  return duration;
};

export const leapYear = (
  duration: number,
  startDate: string,
  expiryDate: string,
): boolean => {
  const start = dayjs(startDate, 'YYYY-MM-DD');
  const expiry = dayjs(expiryDate, 'YYYY-MM-DD');
  const isOneYear =
    start.add(1, 'year').subtract(1, 'day').toDate() === expiry.toDate();
  return duration === 366 && isOneYear;
};
export const isValidDuration = (
  duration: number,
  minDuration: number,
  maxDuration: number,
): boolean => {
  return duration >= minDuration && duration <= maxDuration;
};

/**
 * Calculates the permit fee based on the provided duration, price per term, permit type term, and old amount.
 *
 * @param {number} duration The duration for which the permit is required.
 * @param {number} pricePerTerm The price per term of the permit.
 * @param {number} allowedPermitTerm The term of the permit type.
 * @param {number} oldAmount The old amount (if any) for the permit.
 * @returns {number} The calculated permit fee.
 */
export const currentPermitFee = (
  duration: number,
  pricePerTerm: number,
  allowedPermitTerm: number,
  oldAmount?: Nullable<number>,
  permitStatus?: Nullable<ApplicationStatus>,
  isNoFee?: Nullable<boolean>,
): number => {
  // Calculate the number of permit terms based on the duration
  const permitTerms =
    permitStatus === ApplicationStatus.VOIDED
      ? Math.floor(duration / allowedPermitTerm)
      : Math.ceil(duration / allowedPermitTerm);

  // Special fee calculation for void permit
  if (permitStatus === ApplicationStatus.VOIDED) {
    // If the permit status is voided, return a refund of 0 for permit with no fees, or return the applicable refund amount
    return oldAmount === 0 ? 0 : -pricePerTerm * permitTerms;
  }
  // For non void new application (exclude amendment application), if no fee applies, set the price per term to 0 for new application
  if ((isNoFee && oldAmount === undefined) || oldAmount === 0) return 0;
  if (oldAmount === undefined) oldAmount = 0;
  // Calculate fee for non void permit.
  return oldAmount > 0
    ? pricePerTerm * permitTerms - oldAmount
    : pricePerTerm * permitTerms + oldAmount;
};

export const calculatePermitAmount = (
  permitPaymentHistory: PermitHistoryDto[],
): number => {
  let amount = 0;
  for (const payment of permitPaymentHistory) {
    switch (payment.transactionTypeId) {
      case TransactionType.REFUND:
        amount -= payment.transactionAmount;
        break;
      case TransactionType.PURCHASE:
        amount += payment.transactionAmount;
        break;
      case TransactionType.VOID_PURHCASE:
      case TransactionType.VOID_REFUND:
        throw new NotAcceptableException();
      default:
        throw new NotAcceptableException();
    }
  }

  return amount;
};

export const validAmount = (
  calculatedAmount: number,
  receivedAmount: number,
  transactionType: TransactionType,
): boolean => {
  const isAmountValid =
    receivedAmount.toFixed(2) === Math.abs(calculatedAmount).toFixed(2);

  // For refund transactions, ensure the calculated amount is negative.
  const isRefundValid =
    calculatedAmount < 0 && transactionType === TransactionType.REFUND;

  // Return true if the amounts are valid or if it's a valid refund transaction
  return (
    isAmountValid &&
    (isRefundValid || transactionType !== TransactionType.REFUND)
  );
};
