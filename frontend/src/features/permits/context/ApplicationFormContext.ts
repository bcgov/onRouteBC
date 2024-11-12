import { createContext } from "react";
import { Dayjs } from "dayjs";

import { PermitVehicleDetails } from "../types/PermitVehicleDetails";
import { LOADetail } from "../../settings/types/LOADetail";
import { ApplicationFormData } from "../types/application";
import { getDefaultValues } from "../helpers/getDefaultApplicationFormData";
import { DEFAULT_PERMIT_TYPE } from "../types/PermitType";
import { PermitCondition } from "../types/PermitCondition";
import { PowerUnit, Trailer, VehicleSubType } from "../../manageVehicles/types/Vehicle";
import { Nullable } from "../../../common/types/common";
import { CompanyProfile } from "../../manageProfile/types/manageProfile.d";
import { PermitLOA } from "../types/PermitLOA";
import {
  PAST_START_DATE_STATUSES,
  PastStartDateStatus,
} from "../../../common/components/form/subFormComponents/CustomDatePicker";

interface ApplicationFormContextType {
  initialFormData: ApplicationFormData;
  formData: ApplicationFormData;
  durationOptions: {
    value: number;
    label: string;
  }[];
  vehicleOptions: (PowerUnit | Trailer)[];
  powerUnitSubtypes: VehicleSubType[];
  trailerSubtypes: VehicleSubType[];
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
  onLeave?: () => void;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
  onContinue: () => Promise<void>;
  onSetDuration: (duration: number) => void;
  onSetExpiryDate: (expiry: Dayjs) => void;
  onSetConditions: (conditions: PermitCondition[]) => void;
  onToggleSaveVehicle: (saveVehicle: boolean) => void;
  onSetVehicle: (vehicleDetails: PermitVehicleDetails) => void;
  onClearVehicle: (saveVehicle: boolean) => void;
  onUpdateLOAs: (updatedLOAs: PermitLOA[]) => void;
}

export const ApplicationFormContext = createContext<ApplicationFormContextType>({
  initialFormData: getDefaultValues(DEFAULT_PERMIT_TYPE, undefined),
  formData: getDefaultValues(DEFAULT_PERMIT_TYPE, undefined),
  durationOptions: [],
  vehicleOptions: [],
  powerUnitSubtypes: [],
  trailerSubtypes: [],
  isLcvDesignated: false,
  feature: "",
  companyInfo: undefined,
  isAmendAction: false,
  createdDateTime: undefined,
  updatedDateTime: undefined,
  pastStartDateStatus: PAST_START_DATE_STATUSES.ALLOWED,
  companyLOAs: [],
  revisionHistory: [],
  onLeave: undefined,
  onSave: undefined,
  onCancel: undefined,
  onContinue: async () => undefined,
  onSetDuration: () => undefined,
  onSetExpiryDate: () => undefined,
  onSetConditions: () => undefined,
  onToggleSaveVehicle: () => undefined,
  onSetVehicle: () => undefined,
  onClearVehicle: () => undefined,
  onUpdateLOAs: () => undefined,
});
