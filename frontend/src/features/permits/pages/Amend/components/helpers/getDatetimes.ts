import dayjs, { Dayjs } from "dayjs";

import {
  applyWhenNotNullable,
  getDefaultNullableVal,
} from "../../../../../../common/helpers/util";
import { Nullable } from "../../../../../../common/types/common";
import { Application } from "../../../../types/application";
import { Permit } from "../../../../types/permit";
import { utcToLocalDayjs } from "../../../../../../common/helpers/formatDate";

export const getDatetimes = (
  amendmentApplication?: Nullable<Application>,
  permit?: Nullable<Permit>,
): {
  createdDateTime?: Nullable<Dayjs>;
  updatedDateTime?: Nullable<Dayjs>;
} => {
  // Try to get createdDateTime from amendment application first
  // If amendment application doesn't exist, get it from the initial permit being amended
  const createdDateTime = getDefaultNullableVal(
    applyWhenNotNullable(
      (date) => dayjs(date),
      amendmentApplication?.createdDateTime,
    ),
    applyWhenNotNullable(
      (datetimeStr: string) => utcToLocalDayjs(datetimeStr),
      permit?.createdDateTime,
    ),
  );

  // Try to get updatedDateTime from amendment application first
  // If amendment application doesn't exist, get it from the initial permit being amended
  const updatedDateTime = getDefaultNullableVal(
    applyWhenNotNullable(
      (date) => dayjs(date),
      amendmentApplication?.updatedDateTime,
    ),
    applyWhenNotNullable(
      (datetimeStr: string) => utcToLocalDayjs(datetimeStr),
      permit?.updatedDateTime,
    ),
  );

  return {
    createdDateTime,
    updatedDateTime,
  };
};
