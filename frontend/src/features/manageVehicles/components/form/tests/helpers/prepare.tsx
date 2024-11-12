import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";

import { VEHICLES_URL } from "../../../../../../common/apiManager/endpoints/endpoints";
import { VEHICLES_API } from "../../../../apiManager/endpoints/endpoints";
import { renderForTests } from "../../../../../../common/helpers/testHelper";
import { PowerUnitForm } from "../../PowerUnitForm";
import { PowerUnit, Trailer } from "../../../../types/Vehicle";
import { TrailerForm } from "../../TrailerForm";
import { getDefaultCompanyInfo } from "../../../../../permits/components/dashboard/tests/integration/fixtures/getCompanyInfo";

export const defaultPowerUnitSubtypes = [
  {
    typeCode: "CONCRET",
    type: "Concrete Pumper Trucks",
    description:
      "Concrete Pumper Trucks are used to pump concrete from a cement mixer truck to where the concrete is actually needed. They travel on the highway at their equipped weight with no load.",
  },
];

export const defaultTrailerSubtypes = [
  {
    typeCode: "BOOSTER",
    type: "Boosters",
    description:
      "A Booster is similar to a jeep, but it is used behind a load.",
  },
];

const companyId = getDefaultCompanyInfo().companyId;

const server = setupServer(
  // Mock getting power unit types
  http.get(VEHICLES_API.POWER_UNIT_TYPES, () => {
    return HttpResponse.json([...defaultPowerUnitSubtypes]);
  }),

  // Mock getting trailer types
  http.get(VEHICLES_API.TRAILER_TYPES, () => {
    return HttpResponse.json([...defaultTrailerSubtypes]);
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

      return HttpResponse.json(
        {
          ...(powerUnit as PowerUnit),
        },
        { status: 201 },
      );
    },
  ),

  // Mock updating power unit vehicle
  http.put(
    `${VEHICLES_URL}/companies/:companyId/vehicles/powerUnits/:powerUnitId`,
    async ({ request }) => {
      const reqBody = await request.json();
      const powerUnit = reqBody?.valueOf();
      if (!powerUnit) {
        return HttpResponse.json(null, { status: 400 });
      }

      return HttpResponse.json({
        ...(powerUnit as PowerUnit),
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

      return HttpResponse.json(
        {
          ...(trailer as Trailer),
        },
        { status: 201 },
      );
    },
  ),
  // Mock updating trailer vehicle
  http.put(
    `${VEHICLES_URL}/companies/:companyId/vehicles/trailers/:trailerId`,
    async ({ request }) => {
      const reqBody = await request.json();
      const trailer = reqBody?.valueOf();
      if (!trailer) {
        return HttpResponse.json(null, { status: 400 });
      }

      return HttpResponse.json({
        ...(trailer as Trailer),
      });
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

export const renderTestPowerUnitForm = (powerUnit?: PowerUnit) => {
  const user = userEvent.setup();
  const component = renderForTests(
    <PowerUnitForm
      companyId={companyId}
      powerUnit={powerUnit}
    />
  );

  return { user, component };
};

export const renderTestTrailerForm = (trailer?: Trailer) => {
  const user = userEvent.setup();
  const component = renderForTests(
    <TrailerForm
      companyId={companyId}
      trailer={trailer}
    />
  );

  return { user, component };
};

const commonVehicleDetails = {
  newUnitNumber: "Ken10",
  newMake: "Kenworth",
  newYear: 2020,
  newVin: "123456",
  newPlate: "ABC123",
  newCountry: "Canada",
  newProvince: "Alberta",
};

export const powerUnitDetails = {
  ...commonVehicleDetails,
  newGvw: 85000,
  newTireSize: "300",
  newSubtype: defaultPowerUnitSubtypes[0].type,
};

export const trailerDetails = {
  ...commonVehicleDetails,
  newSubtype: defaultTrailerSubtypes[0].type,
};
