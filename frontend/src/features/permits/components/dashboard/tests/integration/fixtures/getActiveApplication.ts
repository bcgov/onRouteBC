import { factory, nullable, primaryKey } from "@mswjs/data";

import { getDefaultUserDetails } from "./getUserDetails";
import { getDefaultPowerUnits } from "./getVehicleInfo";
import { getDefaultCompanyInfo } from "./getCompanyInfo";
import { TROS_CONDITIONS } from "../../../../../constants/tros";
import { DEFAULT_PERMIT_TYPE, PERMIT_TYPES } from "../../../../../types/PermitType";
import { getExpiryDate } from "../../../../../helpers/permitState";
import { VEHICLE_TYPES } from "../../../../../../manageVehicles/types/Vehicle";
import { PermitStatus } from "../../../../../types/PermitStatus";
import { getDefaultRequiredVal } from "../../../../../../../common/helpers/util";
import { minDurationForPermitType } from "../../../../../helpers/dateSelection";
import {
  DATE_FORMATS,
  dayjsToLocalStr,
  getStartOfDate,
  now,
} from "../../../../../../../common/helpers/formatDate";

import {
  CreateApplicationRequestData,
  UpdateApplicationRequestData,
} from "../../../../../types/application";

const activeApplicationSource = factory({
  application: {
    applicationNumber: primaryKey(String),
    permitId: nullable(String),
    permitStatus: nullable(String),
    companyId: Number,
    permitType: String,
    permitNumber: nullable(String),
    createdDateTime: String,
    updatedDateTime: String,
    permitData: {
      startDate: String,
      permitDuration: Number,
      expiryDate: String,
      contactDetails: {
        firstName: nullable(String),
        lastName: nullable(String),
        phone1: nullable(String),
        phone1Extension: nullable(String),
        phone2: nullable(String),
        phone2Extension: nullable(String),
        email: nullable(String),
        additionalEmail: nullable(String),
        fax: nullable(String),
      },
      vehicleDetails: {
        vin: nullable(String),
        plate: nullable(String),
        make: nullable(String),
        year: nullable(Number),
        countryCode: nullable(String),
        provinceCode: nullable(String),
        vehicleType: nullable(String),
        vehicleSubType: nullable(String),
        saveVehicle: nullable(Boolean),
        unitNumber: nullable(String),
      },
      commodities: Array,
      mailingAddress: {
        addressLine1: nullable(String),
        addressLine2: nullable(String),
        city: nullable(String),
        provinceCode: nullable(String),
        countryCode: nullable(String),
        postalCode: nullable(String),
      },
      feeSummary: nullable(String),
    },
  },
});

export const createApplication = (
  application: CreateApplicationRequestData,
  applicationNumber: string,
  permitId: string,
  createdDateTime: string,
  updatedDateTime: string,
) => {
  return activeApplicationSource.application.create({
    ...application,
    applicationNumber,
    permitId,
    createdDateTime,
    updatedDateTime,
  });
};

export const updateApplication = (
  application: UpdateApplicationRequestData,
  permitId: string,
  applicationNumber: string,
  createdDateTime: string,
  updatedDateTime: string,
  permitStatus: PermitStatus,
) => {
  return activeApplicationSource.application.update({
    where: {
      applicationNumber: {
        equals: applicationNumber,
      },
    },
    data: {
      ...application,
      applicationNumber,
      permitStatus,
      permitId,
      companyId: getDefaultRequiredVal(
        getDefaultUserDetails().companyId,
      ),
      permitType: getDefaultRequiredVal(
        PERMIT_TYPES.TROS,
        application.permitType,
      ),
      createdDateTime,
      updatedDateTime,
    },
  });
};

export const getApplication = () => {
  const applications = activeApplicationSource.application.getAll();
  return applications.length > 0 ? applications[0] : undefined;
};

export const resetApplicationSource = () => {
  activeApplicationSource.application.deleteMany({
    where: {
      applicationNumber: {
        contains: "",
      },
    },
  });
};

export const getDefaultApplication = () => {
  const currentDt = getStartOfDate(now());
  const startDate = dayjsToLocalStr(currentDt, DATE_FORMATS.DATEONLY);
  const permitType = DEFAULT_PERMIT_TYPE;
  const minDuration = minDurationForPermitType(permitType);
  const expiryDt = getExpiryDate(currentDt, minDuration);
  const expiryDate = dayjsToLocalStr(expiryDt, DATE_FORMATS.DATEONLY);
  const { companyId, userDetails } = getDefaultUserDetails();
  
  const contactDetails = {
    firstName: userDetails.firstName,
    lastName: userDetails.lastName,
    phone1: userDetails.phone1,
    phone1Extension: userDetails.phone1Extension,
    phone2: userDetails.phone2,
    phone2Extension: userDetails.phone2Extension,
    email: userDetails.email,
    additionalEmail: "",
    fax: userDetails.fax,
  };

  const vehicle = getDefaultPowerUnits()[0];

  const vehicleDetails = {
    vin: vehicle.vin,
    plate: vehicle.plate,
    make: vehicle.make,
    year: vehicle.year,
    countryCode: vehicle.countryCode,
    provinceCode: vehicle.provinceCode,
    vehicleType: VEHICLE_TYPES.POWER_UNIT,
    vehicleSubType: vehicle.powerUnitTypeCode,
    unitNumber: vehicle.unitNumber,
    vehicleId: "1",
  };

  const conditions = [
    TROS_CONDITIONS[0],
    TROS_CONDITIONS[1],
    { ...TROS_CONDITIONS[2], checked: true },
  ];

  const { mailingAddress } = getDefaultCompanyInfo();

  return {
    companyId,
    userGuid: "AB1CD2EFAB34567CD89012E345FA678B",
    permitType,
    permitData: {
      startDate,
      permitDuration: minDuration,
      expiryDate,
      contactDetails,
      vehicleDetails,
      commodities: conditions,
      mailingAddress,
      loas: [],
    },
  };
};
