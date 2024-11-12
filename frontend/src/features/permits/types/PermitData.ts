import { Dayjs } from "dayjs";

import { Nullable } from "../../../common/types/common";
import { PermitContactDetails } from "./PermitContactDetails";
import { PermitVehicleDetails } from "./PermitVehicleDetails";
import { PermitMailingAddress } from "./PermitMailingAddress";
import { PermitCondition } from "./PermitCondition";
import { PermitLOA } from "./PermitLOA";

export interface PermitData {
  startDate: Dayjs;
  permitDuration: number; // days
  expiryDate: Dayjs;
  contactDetails: PermitContactDetails;
  vehicleDetails: PermitVehicleDetails;
  commodities: PermitCondition[];
  mailingAddress: PermitMailingAddress;
  feeSummary?: Nullable<string>;
  companyName?: Nullable<string>;
  doingBusinessAs?: Nullable<string>;
  clientNumber?: Nullable<string>;
  loas?: Nullable<PermitLOA[]>;
}
