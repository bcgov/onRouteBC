import { useState, useMemo } from "react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";

import { APPLICATIONS_API_ROUTES, CART_API_ROUTES } from "../../../../../apiManager/endpoints/endpoints";
import { renderForTests } from "../../../../../../../common/helpers/testHelper";
import { bcGovTheme } from "../../../../../../../themes/bcGovTheme";
import { ApplicationContext } from "../../../../../context/ApplicationContext";
import { ApplicationReview } from "../../../ApplicationReview";
import { getDefaultApplication } from "../../../../../components/dashboard/tests/integration/fixtures/getActiveApplication";
import { MANAGE_PROFILE_API } from "../../../../../../manageProfile/apiManager/endpoints/endpoints";
import { getDefaultCompanyInfo } from "../../../../../components/dashboard/tests/integration/fixtures/getCompanyInfo";
import { VEHICLES_API } from "../../../../../../manageVehicles/apiManager/endpoints/endpoints";
import { Nullable } from "../../../../../../../common/types/common";
import { PERMIT_STATUSES } from "../../../../../types/PermitStatus";
import { SPECIAL_AUTH_API_ROUTES } from "../../../../../../settings/apiManager/endpoints/endpoints";
import {
  Application,
  CreateApplicationRequestData,
  UpdateApplicationRequestData,
} from "../../../../../types/application";

import {
  dayjsToUtcStr,
  getEndOfDate,
  getStartOfDate,
  now,
  toLocalDayjs,
} from "../../../../../../../common/helpers/formatDate";

import {
  getDefaultPowerUnitSubTypes,
  getDefaultTrailerSubTypes,
} from "../../../../../components/dashboard/tests/integration/fixtures/getVehicleInfo";

export const newApplicationNumber = "A1-00000001-800-R01";
export const newPermitId = "1";
const { permitData, ...otherDetails } = getDefaultApplication();
export const vehicleDetails = permitData.vehicleDetails;
export const defaultApplicationData = {
  ...otherDetails,
  applicationNumber: newApplicationNumber,
  createdDateTime: now(),
  updatedDateTime: now(),
  permitData: {
    ...permitData,
    startDate: getStartOfDate(toLocalDayjs(permitData.startDate)),
    expiryDate: getEndOfDate(toLocalDayjs(permitData.expiryDate)),
  },
  permitStatus: PERMIT_STATUSES.IN_PROGRESS,
} as Application;

export const companyInfo = getDefaultCompanyInfo();
export const companyInfoTitle = "Company Information";
export const companyInfoDescription =
  "If the Company Mailing Address is incorrect, please contact your onRouteBC Administrator.";
export const companyMailAddrTitle = "Company Mailing Address";
export const contactInfoTitle = "Contact Information";
export const vehicleSubtypes = [
  ...getDefaultPowerUnitSubTypes(),
  ...getDefaultTrailerSubTypes(),
];

const server = setupServer(
  http.get(`${MANAGE_PROFILE_API.COMPANIES}/:companyId`, () => {
    return HttpResponse.json({
      ...companyInfo,
    });
  }),

  http.post(
    `${APPLICATIONS_API_ROUTES.CREATE(companyInfo.companyId.toString())}`,
    async ({ request }) => {
      const reqBody = await request.json();
      const application = reqBody?.valueOf();
      if (!application) {
        return HttpResponse.json(null, { status: 400 });
      }

      const applicationData = {
        ...(application as CreateApplicationRequestData),
        permitId: newPermitId,
        originalPermitId: newPermitId,
        applicationNumber: newApplicationNumber,
        createdDateTime: dayjsToUtcStr(now()),
        updatedDateTime: dayjsToUtcStr(now()),
        permitStatus: PERMIT_STATUSES.IN_PROGRESS,
      };

      return HttpResponse.json(
        {
          ...applicationData,
        },
        { status: 201 },
      );
    },
  ),

  http.put(
    APPLICATIONS_API_ROUTES.UPDATE(companyInfo.companyId.toString(), ":id"),
    async ({ request, params }) => {
      const { id } = params;
      const reqBody = await request.json();
      const application = reqBody?.valueOf();
      if (!application) {
        return HttpResponse.json(null, { status: 400 });
      }

      const applicationData = {
        ...(application as UpdateApplicationRequestData),
        permitId: newPermitId,
        originalPermitId: newPermitId,
        applicationNumber: String(id),
        createdDateTime: dayjsToUtcStr(now()),
        updatedDateTime: dayjsToUtcStr(now()),
        permitStatus: PERMIT_STATUSES.IN_PROGRESS,
      };

      return HttpResponse.json(
        {
          ...applicationData,
        },
        { status: 200 },
      );
    },
  ),

  http.get(VEHICLES_API.POWER_UNIT_TYPES, () => {
    return HttpResponse.json([
      ...getDefaultPowerUnitSubTypes(), // get power unit subtypes from mock vehicle store
    ]);
  }),

  http.get(VEHICLES_API.TRAILER_TYPES, () => {
    return HttpResponse.json([
      ...getDefaultTrailerSubTypes(), // get trailer subtypes from mock vehicle store
    ]);
  }),

  http.post(
    `${CART_API_ROUTES.ADD(companyInfo.companyId.toString())}`,
    async ({ request }) => {
      const reqBody = await request.json();
      const addCartItemRequest = reqBody?.valueOf();
      if (!addCartItemRequest) {
        return HttpResponse.json(null, { status: 400 });
      }

      const applicationIds = (addCartItemRequest as any).appliactionIds;
      return HttpResponse.json({
        success: [...applicationIds],
        failure: [],
      });
    },
  ),

  http.get(
    `${CART_API_ROUTES.COUNT(companyInfo.companyId.toString())}`,
    () => {
      return HttpResponse.json(1);
    },
  ),

  http.get(
    `${SPECIAL_AUTH_API_ROUTES.SPECIAL_AUTH.GET(companyInfo.companyId.toString())}`,
    () => {
      return HttpResponse.json(
        {
          companyId: companyInfo.companyId,
          specialAuthId: 1,
          isLcvAllowed: false,
          noFeeType: null,
        },
      );
    },
  ),
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

const ComponentWithWrapper = ({
  applicationData,
}: {
  applicationData: Application;
}) => {
  const [testApplicationData, setTestApplicationData] =
    useState<Nullable<Application>>(applicationData);

  return (
    <ThemeProvider theme={bcGovTheme}>
      <ApplicationContext.Provider
        value={useMemo(
          () => ({
            applicationData: testApplicationData,
            setApplicationData: setTestApplicationData,
          }),
          [testApplicationData],
        )}
      >
        <ApplicationReview />
      </ApplicationContext.Provider>
    </ThemeProvider>
  );
};

export const renderTestComponent = (applicationData: Application) => {
  const user = userEvent.setup();
  const component = renderForTests(
    <ComponentWithWrapper applicationData={applicationData} />,
  );

  return { user, component };
};
