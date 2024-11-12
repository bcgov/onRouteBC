import PermitApplication from './permit-application.type';

export const testStos: PermitApplication = {
  permitType: 'STOS',
  permitData: {
    companyName: 'Sonic Delivery Services',
    clientNumber: 'B3-000102-466',
    permitDuration: 7,
    commodities: [
      {
        description: 'General Permit Conditions',
        condition: 'CVSE-1000',
        conditionLink:
          'https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1251',
        checked: true,
        disabled: true,
      },
      {
        description: 'Permit Scope and Limitation',
        condition: 'CVSE-1070',
        conditionLink:
          'https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1261',
        checked: true,
        disabled: true,
      },
    ],
    contactDetails: {
      firstName: 'Chief',
      lastName: 'Baker',
      phone1: '(250) 555-1234',
      phone1Extension: null,
      phone2: '(250) 555-4321',
      phone2Extension: null,
      email: 'chief.baker@gov.bc.ca',
      additionalEmail: 'baker.chief@gov.bc.ca',
      fax: null,
    },
    mailingAddress: {
      addressLine1: '940 Blanshard',
      addressLine2: null,
      city: 'Victoria',
      provinceCode: 'BC',
      countryCode: 'CA',
      postalCode: 'V8B1A2',
    },
    permittedCommodity: {
      commodityType: 'EMPTYXX',
      loadDescription: 'empty',
    },
    vehicleConfiguration: {
      overallLength: 25,
      overallWidth: 3,
      overallHeight: 4.1,
      frontProjection: 1,
      rearProjection: 1,
      trailers: [
        {
          vehicleSubType: 'JEEPSRG',
        },
        {
          vehicleSubType: 'PLATFRM',
        },
      ],
    },
    permittedRoute: {
      manualRoute: {
        origin: 'Victoria, BC',
        destination: 'Prince George, BC',
        highwaySequence: ['1', '5'],
      },
      routeDetails: 'Just driving here',
    },
    vehicleDetails: {
      vehicleId: '101',
      unitNumber: '321',
      vin: '654321',
      plate: 'D654321',
      make: 'Custom',
      year: 2010,
      countryCode: 'CA',
      provinceCode: 'BC',
      vehicleType: 'powerUnit',
      vehicleSubType: 'TRKTRAC',
      licensedGVW: 40000,
      saveVehicle: false,
    },
    feeSummary: '30',
    startDate: '2024-04-18',
    expiryDate: '2024-05-17',
    applicationNotes: 'Call for credit card payment',
  },
};
