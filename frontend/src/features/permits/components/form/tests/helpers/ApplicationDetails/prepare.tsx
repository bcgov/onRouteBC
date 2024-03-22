import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { Dayjs } from "dayjs";

import { utcToLocalDayjs } from "../../../../../../../common/helpers/formatDate";
import { MANAGE_PROFILE_API } from "../../../../../../manageProfile/apiManager/endpoints/endpoints";
import { renderForTests } from "../../../../../../../common/helpers/testHelper";
import { ApplicationDetails } from "../../../ApplicationDetails";
import { PERMIT_TYPES } from "../../../../../types/PermitType";

export const defaultCompanyInfo = {
  companyId: 74,
  companyGUID: "AB1CD2EFAB34567CD89012E345FA678B",
  clientNumber: "B3-000001-700",
  legalName: "My Company LLC",
  mailingAddress: {
    addressLine1: "123-4567 My Street",
    city: "Richmond",
    provinceCode: "BC",
    countryCode: "CA",
    postalCode: "V1C 2B3",
  },
  email: "companyhq@mycompany.co",
  phone: "604-123-4567",
  primaryContact: {
    firstName: "My",
    lastName: "Lastname",
    phone1: "604-123-4567",
    email: "my.company@mycompany.co",
    city: "Richmond",
    provinceCode: "BC",
    countryCode: "CA",
  },
  isSuspended: false,
};

export const country = "Canada";
export const province = "British Columbia";
export const createdAt = utcToLocalDayjs("2023-06-14T09:00:00.000Z");
export const updatedAt = utcToLocalDayjs("2023-06-15T13:00:00.000Z");
export const defaultApplicationNumber = "ABC-123456";
export const permitType = PERMIT_TYPES.TROS;

const server = setupServer(
  // Mock get company info
  http.get(`${MANAGE_PROFILE_API.COMPANIES}/:companyId`, () => {
    return HttpResponse.json({
      ...defaultCompanyInfo,
    });
  }),
);

export const listenToMockServer = () => {
  server.listen();
};

export const resetMockServer = () => {
  server.resetHandlers();
};

export const closeMockServer = () => {
  server.close();
};

export const renderTestComponent = (
  permitType?: string,
  applicationNumber?: string,
  createdDt?: Dayjs,
  updatedDt?: Dayjs,
) => {
  return renderForTests(
    <ApplicationDetails
      permitType={permitType}
      infoNumberType="application"
      infoNumber={applicationNumber}
      createdDateTime={createdDt}
      updatedDateTime={updatedDt}
      companyInfo={defaultCompanyInfo}
    />,
  );
};
