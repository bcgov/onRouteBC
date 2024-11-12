import { PolicyDefinition } from '../../types/policy-definition';

export const allEventTypes: PolicyDefinition = {
  version: '2024.03.18.001',
  geographicRegions: [],
  commonRules: [],
  permitTypes: [
    {
      id: 'TROS',
      name: 'Term Oversize',
      routingRequired: false,
      weightDimensionRequired: false,
      sizeDimensionRequired: false,
      commodityRequired: false,
      allowedVehicles: [
        'trucktractor',
        'truck',
        'semi',
        'platform',
        'ogoilfieldsemi',
      ],
      rules: [
        {
          conditions: {
            not: {
              fact: 'permitData',
              path: '$.permitDuration',
              operator: 'equal',
              value: 31,
            },
          },
          event: {
            type: 'violation',
            params: {
              message: 'Violation A',
            },
          },
        },
        {
          conditions: {
            not: {
              fact: 'permitData',
              path: '$.permitDuration',
              operator: 'equal',
              value: 32,
            },
          },
          event: {
            type: 'requirement',
            params: {
              message: 'Requirement A',
            },
          },
        },
        {
          conditions: {
            not: {
              fact: 'permitData',
              path: '$.permitDuration',
              operator: 'equal',
              value: 33,
            },
          },
          event: {
            type: 'warning',
            params: {
              message: 'Warning A',
            },
          },
        },
        {
          conditions: {
            not: {
              fact: 'permitData',
              path: '$.permitDuration',
              operator: 'equal',
              value: 34,
            },
          },
          event: {
            type: 'information',
            params: {
              message: 'Message A',
            },
          },
        },
        {
          conditions: {
            not: {
              fact: 'permitData',
              path: '$.permitDuration',
              operator: 'equal',
              value: 35,
            },
          },
          event: {
            type: 'information',
            params: {
              invalid_message: 'Message B',
            },
          },
        },
        {
          conditions: {
            not: {
              fact: 'permitData',
              path: '$.permitDuration',
              operator: 'equal',
              value: 35,
            },
          },
          event: {
            type: 'information',
          },
        },
        {
          conditions: {
            not: {
              fact: 'permitData',
              path: '$.permitDuration',
              operator: 'equal',
              value: 36,
            },
          },
          event: {
            type: '__invalid',
            params: {
              message: 'Invalid A',
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
