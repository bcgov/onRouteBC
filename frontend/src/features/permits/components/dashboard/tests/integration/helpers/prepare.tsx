import { ThemeProvider } from "@mui/material/styles";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

import { renderForTests } from "../../../../../../../common/helpers/testHelper";
import { bcGovTheme } from "../../../../../../../themes/bcGovTheme";
import { ApplicationStepPage } from "../../../ApplicationStepPage";
import { APPLICATIONS_API_ROUTES } from "../../../../../apiManager/endpoints/endpoints";
import { VEHICLES_API } from "../../../../../../manageVehicles/apiManager/endpoints/endpoints";
import { VEHICLES_URL } from "../../../../../../../common/apiManager/endpoints/endpoints";
import { MANAGE_PROFILE_API } from "../../../../../../manageProfile/apiManager/endpoints/endpoints";
import { getDefaultCompanyInfo } from "../fixtures/getCompanyInfo";
import { getDefaultUserDetails } from "../fixtures/getUserDetails";
import { getDefaultRequiredVal } from "../../../../../../../common/helpers/util";
import { APPLICATION_STEP_CONTEXTS, APPLICATION_STEPS } from "../../../../../../../routes/constants";
import { Nullable } from "../../../../../../../common/types/common";
import { PERMIT_STATUSES } from "../../../../../types/PermitStatus";
import { SPECIAL_AUTH_API_ROUTES } from "../../../../../../settings/apiManager/endpoints/endpoints";
import { getCountryFullName } from "../../../../../../../common/helpers/countries/getCountryFullName";
import { getProvinceFullName } from "../../../../../../../common/helpers/countries/getProvinceFullName";
import {
  PowerUnit,
  Trailer,
} from "../../../../../../manageVehicles/types/Vehicle";

import {
  CreateApplicationRequestData,
  UpdateApplicationRequestData,
} from "../../../../../types/application";

import {
  dayjsToUtcStr,
  now,
} from "../../../../../../../common/helpers/formatDate";

import {
  createApplication,
  getApplication,
  updateApplication,
} from "../fixtures/getActiveApplication";

import OnRouteBCContext, {
  OnRouteBCContextType,
} from "../../../../../../../common/authentication/OnRouteBCContext";

import {
  createPowerUnit,
  createTrailer,
  getAllPowerUnits,
  getAllTrailers,
  getDefaultPowerUnitSubTypes,
  getDefaultTrailerSubTypes,
  updatePowerUnit,
  updateTrailer,
} from "../fixtures/getVehicleInfo";

// Use some default user details values to give to the OnRouteBCContext context provider
export const defaultUserDetails = getDefaultUserDetails();
export const newApplicationNumber = "A1-00000001-800-R01";
export const newPermitId = "1";
export const currDtUtcStr = dayjsToUtcStr(now());
export const companyInfo = getDefaultCompanyInfo();

// Mock API endpoints
const server = setupServer(
  // Mock creating/saving application
  http.post(
    `${VEHICLES_URL}/companies/:companyId/applications`,
    async ({ request }) => {
      const reqBody = await request.json();
      const application = reqBody?.valueOf();
      if (!application) {
        return HttpResponse.json(null, { status: 400 });
      }

      const applicationData = {
        ...(application as CreateApplicationRequestData),
        permitStatus: PERMIT_STATUSES.IN_PROGRESS,
      };

      const createdApplication = createApplication(
        applicationData,
        newApplicationNumber,
        newPermitId,
        currDtUtcStr,
        currDtUtcStr,
      ); // add to mock application store

      return HttpResponse.json(
        {
          ...createdApplication,
        },
        { status: 201 },
      );
    },
  ),

  // Mock updating/saving application
  http.put(
    `${VEHICLES_URL}/companies/:companyId/applications/:id`,
    async ({ request, params }) => {
      const { id } = params;
      const reqBody = await request.json();
      const application = reqBody?.valueOf();
      if (!application) {
        return HttpResponse.json(null, { status: 400 });
      }

      const applicationData = application as UpdateApplicationRequestData;

      const updatedApplication = updateApplication(
        applicationData,
        newPermitId,
        String(id),
        currDtUtcStr,
        currDtUtcStr,
        PERMIT_STATUSES.IN_PROGRESS,
      ); // update application in mock application store

      if (!updatedApplication) {
        return HttpResponse.json(null, { status: 404 });
      }
      return HttpResponse.json({
        ...updatedApplication,
      });
    },
  ),

  // Mock getting application
  http.get(
    `${APPLICATIONS_API_ROUTES.GET(getDefaultUserDetails().companyId.toString(), ":permitId")}`,
    () => {
      return HttpResponse.json({
        // get application from mock application store (there's only 1 application or empty), since we're testing save/create/edit behaviour
        data: getApplication(),
      });
    },
  ),

  // Mock getting power unit types
  http.get(VEHICLES_API.POWER_UNIT_TYPES, () => {
    return HttpResponse.json([
      ...getDefaultPowerUnitSubTypes(), // get power unit types from mock vehicle store
    ]);
  }),

  // Mock getting trailer types
  http.get(VEHICLES_API.TRAILER_TYPES, () => {
    return HttpResponse.json([
      ...getDefaultTrailerSubTypes(), // get trailer types from mock vehicle store
    ]);
  }),

  // Mock getting power unit vehicles
  http.get(`${VEHICLES_URL}/companies/:companyId/vehicles/powerUnits`, () => {
    return HttpResponse.json([
      ...getAllPowerUnits(), // get power unit vehicles from mock vehicle store
    ]);
  }),

  // Mock getting trailer vehicles
  http.get(`${VEHICLES_URL}/companies/:companyId/vehicles/trailers`, () => {
    return HttpResponse.json([
      ...getAllTrailers(), // get trailer vehicles from mock vehicle store
    ]);
  }),

  // Mock getting company details
  http.get(`${MANAGE_PROFILE_API.COMPANIES}/:companyId`, () => {
    return HttpResponse.json({
      ...companyInfo,
    });
  }),

  // Mock creating power unit vehicle
  http.post(
    `${VEHICLES_URL}/companies/:companyId/vehicles/powerUnits`,
    async ({ request }) => {
      const reqBody = await request.json();
      const powerUnit = reqBody?.valueOf();
      if (!powerUnit) {
        return HttpResponse.json(null, { status: 400 });
      }

      const newPowerUnit = createPowerUnit(powerUnit as PowerUnit); // create power unit vehicle in mock vehicle store
      return HttpResponse.json(
        {
          ...newPowerUnit,
        },
        { status: 201 },
      );
    },
  ),

  // Mock updating power unit vehicle
  http.put(
    `${VEHICLES_URL}/companies/:companyId/vehicles/powerUnits/:powerUnitId`,
    async ({ request, params }) => {
      const id = String(params.powerUnitId);
      const reqBody = await request.json();
      const powerUnit = reqBody?.valueOf();
      if (!powerUnit) {
        return HttpResponse.json(null, { status: 400 });
      }

      const updatedPowerUnit = updatePowerUnit(id, powerUnit as PowerUnit); // update power unit vehicle in mock vehicle store
      return HttpResponse.json({
        ...updatedPowerUnit,
      });
    },
  ),

  // Mock creating trailer vehicle
  http.post(
    `${VEHICLES_URL}/companies/:companyId/vehicles/trailers`,
    async ({ request }) => {
      const reqBody = await request.json();
      const trailer = reqBody?.valueOf();
      if (!trailer) {
        return HttpResponse.json(null, { status: 400 });
      }

      const newTrailer = createTrailer(trailer as Trailer); // create trailer vehicle in mock vehicle store
      return HttpResponse.json(
        {
          ...newTrailer,
        },
        { status: 201 },
      );
    },
  ),

  // Mock updating trailer vehicle
  http.put(
    `${VEHICLES_URL}/companies/:companyId/vehicles/trailers/:trailerId`,
    async ({ request, params }) => {
      const id = String(params.trailerId);
      const reqBody = await request.json();
      const trailer = reqBody?.valueOf();
      if (!trailer) {
        return HttpResponse.json(null, { status: 400 });
      }

      const updatedTrailer = updateTrailer(id, trailer as Trailer); // update trailer vehicle in mock vehicle store
      return HttpResponse.json({
        ...updatedTrailer,
      });
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

export const ComponentWithWrapper = (userDetails: OnRouteBCContextType) => {
  return (
    <ThemeProvider theme={bcGovTheme}>
      <OnRouteBCContext.Provider value={userDetails}>
        <ApplicationStepPage
          applicationStep={APPLICATION_STEPS.DETAILS}
          applicationStepContext={APPLICATION_STEP_CONTEXTS.APPLY}
        />
      </OnRouteBCContext.Provider>
    </ThemeProvider>
  );
};

export const renderTestComponent = (userDetails: OnRouteBCContextType) => {
  const user = userEvent.setup();
  const component = renderForTests(ComponentWithWrapper(userDetails));

  return { user, component };
};

export const getVehicleDetails = (
  usage: "create" | "update",
  saveVehicle: boolean,
) => {
  const powerUnits = getAllPowerUnits();
  const existingVehicle = powerUnits[0];
  const updatedProvinceAbbr = "AB";
  const vin = getDefaultRequiredVal(
    "",
    existingVehicle.vin as Nullable<string>,
  );

  const vehicle = {
    ...existingVehicle,
    powerUnitId: usage === "create" ? "" : existingVehicle.powerUnitId,
    vin: usage === "create" ? `${vin.slice(1)}1` : existingVehicle.vin,
    provinceCode:
      usage === "create" ? existingVehicle.provinceCode : updatedProvinceAbbr,
  };

  const vehicleSubtype = getDefaultRequiredVal(
    "",
    getDefaultPowerUnitSubTypes().find(
      (subtype) => subtype.typeCode === vehicle.powerUnitTypeCode,
    )?.type,
  );

  return {
    formDetails: {
      vehicleId: vehicle.powerUnitId,
      vin: vehicle.vin,
      plate: vehicle.plate,
      make: vehicle.make,
      year: getDefaultRequiredVal(0, vehicle.year as Nullable<number>),
      country: getCountryFullName(vehicle.countryCode),
      province: getProvinceFullName(
        vehicle.countryCode,
        vehicle.provinceCode,
      ),
      vehicleType: "Power Unit",
      vehicleSubtype,
      saveVehicle,
    },
    additionalInfo: {
      originalVehicles: powerUnits,
      vehicleUsed: vehicle,
      updatedProvinceAbbr,
    },
  };
};
