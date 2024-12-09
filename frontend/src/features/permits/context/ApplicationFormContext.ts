import { createContext } from "react";
import { Dayjs } from "dayjs";
import { Policy } from "onroute-policy-engine";

import { LOADetail } from "../../settings/types/LOADetail";
import { ApplicationFormData } from "../types/application";
import { getDefaultValues } from "../helpers/getDefaultApplicationFormData";
import { DEFAULT_PERMIT_TYPE } from "../types/PermitType";
import { PowerUnit, Trailer } from "../../manageVehicles/types/Vehicle";
import { Nullable } from "../../../common/types/common";
import { CompanyProfile } from "../../manageProfile/types/manageProfile.d";
import {
  PAST_START_DATE_STATUSES,
  PastStartDateStatus,
} from "../../../common/components/form/subFormComponents/CustomDatePicker";

interface ApplicationFormContextType {
  initialFormData: ApplicationFormData;
  formData: ApplicationFormData;
  policyEngine: Nullable<Policy>;
  durationOptions: {
    value: number;
    label: string;
  }[];
  allVehiclesFromInventory: (PowerUnit | Trailer)[];
  powerUnitSubtypeNamesMap: Map<string, string>;
  trailerSubtypeNamesMap: Map<string, string>;
  isLcvDesignated: boolean;
  feature: string;
  companyInfo?: Nullable<CompanyProfile>;
  isAmendAction: boolean;
  createdDateTime?: Nullable<Dayjs>;
  updatedDateTime?: Nullable<Dayjs>;
  pastStartDateStatus: PastStartDateStatus;
  companyLOAs: LOADetail[];
  revisionHistory: {
    permitId: number;
    name: string;
    revisionDateTime: string;
    comment: string;
  }[];
  policyViolations: Record<string, string>;
  clearViolation: (fieldReference: string) => void;
  triggerPolicyValidation: () => Promise<Record<string, string>>;
  onLeave?: () => void;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
  onContinue: () => Promise<void>;
}

export const ApplicationFormContext = createContext<ApplicationFormContextType>({
  initialFormData: getDefaultValues(DEFAULT_PERMIT_TYPE, undefined),
  formData: getDefaultValues(DEFAULT_PERMIT_TYPE, undefined),
  policyEngine: undefined,
  durationOptions: [],
  allVehiclesFromInventory: [],
  powerUnitSubtypeNamesMap: new Map<string, string>(),
  trailerSubtypeNamesMap: new Map<string, string>(),
  isLcvDesignated: false,
  feature: "",
  companyInfo: undefined,
  isAmendAction: false,
  createdDateTime: undefined,
  updatedDateTime: undefined,
  pastStartDateStatus: PAST_START_DATE_STATUSES.ALLOWED,
  companyLOAs: [],
  revisionHistory: [],
  policyViolations: {},
  clearViolation: () => undefined,
  triggerPolicyValidation: async () => ({}),
  onLeave: undefined,
  onSave: undefined,
  onCancel: undefined,
  onContinue: async () => undefined,
});
