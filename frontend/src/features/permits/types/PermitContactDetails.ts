import { Nullable } from "../../../common/types/common";

export interface PermitContactDetails {
  firstName: string;
  lastName: string;
  phone1: string;
  phone1Extension?: Nullable<string>;
  phone2?: Nullable<string>;
  phone2Extension?: Nullable<string>;
  email: string;
  additionalEmail?: Nullable<string>;
}
