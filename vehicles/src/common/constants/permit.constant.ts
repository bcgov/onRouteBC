import { PermitType } from '../enum/permit-type.enum';

export const TROS_TERM = 30;
export const TROS_PRICE_PER_TERM = 30;
export const TROS_MIN_VALID_DURATION = 1;
export const TROS_MAX_VALID_DURATION = 366;
export const TROW_TERM = 30;
export const TROW_PRICE_PER_TERM = 100;
export const TROW_MIN_VALID_DURATION = 1;
export const TROW_MAX_VALID_DURATION = 366;

export const PERMIT_TYPES_FOR_QUEUE: readonly PermitType[] = [
  PermitType.SINGLE_TRIP_OVERSIZE,
];
