import { Dayjs } from "dayjs";

import { applyWhenNotNullable } from "../../../common/helpers/util";
import { Application, ApplicationResponseData } from "../types/application";
import {
  getEndOfDate,
  getStartOfDate,
  now,
  toLocalDayjs,
  utcToLocalDayjs,
} from "../../../common/helpers/formatDate";
import { getDurationOrDefault } from "./getDefaultApplicationFormData";
import { getExpiryDate } from "./permitState";
import { minDurationForPermitType } from "./dateSelection";

/**
 * Deserializes an ApplicationResponseData object (received from backend) to an Application object
 * @param response ApplicationResponseData object received as response data from backend
 * @returns Deserialized Application object that can be used by form fields and the front-end app
 */
export const deserializeApplicationResponse = (
  response: ApplicationResponseData,
): Application => {
  const startDateOrDefault = applyWhenNotNullable(
    (datetimeStr: string): Dayjs => getStartOfDate(toLocalDayjs(datetimeStr)),
    response.permitData.startDate,
    getStartOfDate(now()),
  );

  const permitType = response.permitType;
  const durationOrDefault = getDurationOrDefault(
    minDurationForPermitType(permitType),
    response.permitData.permitDuration,
  );

  const expiryDateOrDefault = applyWhenNotNullable(
    (datetimeStr: string): Dayjs => getEndOfDate(toLocalDayjs(datetimeStr)),
    response.permitData.expiryDate,
    getExpiryDate(startDateOrDefault, durationOrDefault),
  );

  return {
    ...response,
    createdDateTime: applyWhenNotNullable(
      (datetimeStr: string): Dayjs => utcToLocalDayjs(datetimeStr),
      response.createdDateTime,
    ),
    updatedDateTime: applyWhenNotNullable(
      (datetimeStr: string): Dayjs => utcToLocalDayjs(datetimeStr),
      response.updatedDateTime,
    ),
    permitData: {
      ...response.permitData,
      startDate: startDateOrDefault,
      expiryDate: expiryDateOrDefault,
    },
  };
};
