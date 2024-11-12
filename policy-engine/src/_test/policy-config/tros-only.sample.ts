import { PolicyDefinition } from '../../types/policy-definition';

export const trosOnly: PolicyDefinition = {
  version: '2024.03.18.001',
  geographicRegions: [],
  commonRules: [
    {
      conditions: {
        not: {
          fact: 'permitData',
          path: '$.companyName',
          operator: 'stringMinimumLength',
          value: 1,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Company is required',
          code: 'field-validation-error',
          fieldReference: 'permitData.companyName',
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData',
          path: '$.contactDetails.firstName',
          operator: 'stringMinimumLength',
          value: 1,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Contact first name is required',
          code: 'field-validation-error',
          fieldReference: 'permitData.contactDetails.firstName',
        },
      },
    },
    {
      conditions: {
        any: [
          {
            fact: 'permitData',
            path: '$.startDate',
            operator: 'dateLessThan',
            value: {
              fact: 'validationDate',
            },
          },
        ],
      },
      event: {
        type: 'violation',
        params: {
          message: 'Permit start date cannot be in the past',
          code: 'field-validation-error',
          fieldReference: 'permitData.startDate',
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData',
          path: '$.vehicleDetails.vin',
          operator: 'regex',
          value: '^[a-zA-Z0-9]{6}$',
        },
      },
      event: {
        type: 'violation',
        params: {
          message:
            'Vehicle Identification Number (vin) must be 6 alphanumeric characters',
          code: 'field-validation-error',
          fieldReference: 'permitData.vehicleDetails.vin',
        },
      },
    },
  ],
  permitTypes: [
    {
      id: 'TROS',
      name: 'Term Oversize',
      routingRequired: false,
      weightDimensionRequired: false,
      sizeDimensionRequired: false,
      commodityRequired: false,
      allowedVehicles: ['TRKTRAK', 'TRUCK', 'SEMITRL', 'PLTFRM', 'OGSEMI'],
      rules: [
        {
          conditions: {
            all: [
              {
                not: {
                  fact: 'permitData',
                  path: '$.permitDuration',
                  operator: 'in',
                  value: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
                },
              },
              {
                not: {
                  fact: 'permitData',
                  path: '$.permitDuration',
                  operator: 'equal',
                  value: {
                    fact: 'daysInPermitYear',
                  },
                },
              },
            ],
          },
          event: {
            type: 'violation',
            params: {
              message: 'Duration must be in 30 day increments or a full year',
              code: 'field-validation-error',
              fieldReference: 'permitData.permitDuration',
            },
          },
        },
        {
          conditions: {
            not: {
              fact: 'permitData',
              path: '$.vehicleDetails.vehicleSubType',
              operator: 'in',
              value: {
                fact: 'allowedVehicles',
              },
            },
          },
          event: {
            type: 'violation',
            params: {
              message: 'Vehicle type not permittable for this permit type',
              code: 'field-validation-error',
              fieldReference: 'permitData.vehicleDetails.vehicleSubType',
            },
          },
        },
      ],
    },
  ],
  globalWeightDefaults: {
    powerUnits: [],
    trailers: [],
  },
  globalSizeDefaults: {
    fp: 3,
    rp: 6.5,
    w: 2.6,
    h: 4.15,
    l: 31,
  },
  vehicleCategories: {
    trailerCategories: [],
    powerUnitCategories: [],
  },
  vehicleTypes: {
    powerUnitTypes: [],
    trailerTypes: [],
  },
  commodities: [],
};
