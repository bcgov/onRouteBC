import { PolicyDefinition } from '../../types/policy-definition';

export const stosPolicyConfig: PolicyDefinition = {
  version: '2024.03.18.001',
  geographicRegions: [
    {
      id: 'LMN',
      name: 'Lower Mainland',
    },
    {
      id: 'KTN',
      name: 'Kootenay',
    },
    {
      id: 'PCE',
      name: 'Peace',
    },
    {
      id: 'BCD',
      name: 'BC Default',
    },
  ],
  commonRules: [],
  permitTypes: [
    {
      id: 'STOS',
      name: 'Single Trip Oversize',
      routingRequired: true,
      weightDimensionRequired: false,
      sizeDimensionRequired: true,
      commodityRequired: true,
      allowedCommodities: ['EMPTYXX', 'BRGBEAM', 'AUTOCRR', 'BRSHCUT'],
      allowedVehicles: [
        'DOLLIES',
        'FEBGHSE',
        'FECVYER',
        'FEDRMMX',
        'FEPNYTR',
        'FESEMTR',
        'FEWHELR',
        'REDIMIX',
        'CONCRET',
        'CRAFTAT',
        'CRAFTMB',
        'GRADERS',
        'MUNFITR',
        'OGOILSW',
        'OGSERVC',
        'OGSRRAH',
        'PICKRTT',
        'TOWVEHC',
      ],
      rules: [
        {
          conditions: {
            any: [
              {
                not: {
                  fact: 'permitData',
                  path: '$.permitDuration',
                  operator: 'lessThanInclusive',
                  value: 7,
                },
              },
              {
                not: {
                  fact: 'permitData',
                  path: '$.permitDuration',
                  operator: 'greaterThan',
                  value: 0,
                },
              },
            ],
          },
          event: {
            type: 'violation',
            params: {
              message: 'Duration must be 7 days or less',
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
      costRules: [
        {
          fact: 'fixedCost',
          params: {
            cost: 15,
          },
        },
      ],
    },
    {
      id: 'TROS',
      name: 'Term Oversize',
      routingRequired: false,
      weightDimensionRequired: false,
      sizeDimensionRequired: false,
      commodityRequired: false,
      allowedVehicles: ['TRKTRAC'],
      rules: [],
    },
  ],
  globalWeightDefaults: {
    powerUnits: [],
    trailers: [],
  },
  vehicleCategories: {
    trailerCategories: [
      {
        id: 'trailer',
        name: 'Default trailer category',
      },
      {
        id: 'accessory',
        name: 'Accessory trailer such as jeep or booster, to be used alongside other trailers. Not permittable on its own as a trailer in a combination.',
      },
      {
        id: 'pseudo',
        name: 'Placeholder for a trailer in a combination with no trailer (such as when a brushcutter is permitted with no trailer).',
      },
    ],
    powerUnitCategories: [
      {
        id: 'powerunit',
        name: 'Default power unit category',
      },
    ],
  },
  vehicleTypes: {
    powerUnitTypes: [
      {
        id: 'BUSCRUM',
        name: 'Buses/Crummies',
        category: 'powerunit',
      },
      {
        id: 'BUSTRLR',
        name: 'Inter-City Bus (Pulling Pony Trailer)',
        category: 'powerunit',
      },
      {
        id: 'CONCRET',
        name: 'Concrete Pumper Trucks',
        category: 'powerunit',
      },
      {
        id: 'CRAFTAT',
        name: 'Cranes, Rubber-Tired Loaders, Firetrucks - All Terrain',
        category: 'powerunit',
      },
      {
        id: 'CRAFTMB',
        name: 'Cranes, Rubber-Tired Loaders, Firetrucks - Mobile',
        category: 'powerunit',
      },
      {
        id: 'DDCKBUS',
        name: 'Double Decker Buses',
        category: 'powerunit',
      },
      {
        id: 'FARMVEH',
        name: 'Farm Vehicles',
        category: 'powerunit',
      },
      {
        id: 'GRADERS',
        name: 'Fixed Equipment - Trucks/Graders etc.',
        category: 'powerunit',
      },
      {
        id: 'LCVRMDB',
        name: 'Long Combination Vehicles (LCV) - Rocky Mountain Doubles',
        category: 'powerunit',
      },
      {
        id: 'LCVTPDB',
        name: 'Long Combination Vehicles (LCV) - Turnpike Doubles',
        category: 'powerunit',
      },
      {
        id: 'LOGGING',
        name: 'Logging Trucks',
        category: 'powerunit',
      },
      {
        id: 'LOGOFFH',
        name: 'Logging Trucks - Off-Highway',
        category: 'powerunit',
      },
      {
        id: 'LWBTRCT',
        name: 'Long Wheelbase Truck Tractors Exceeding 6.2 m up to 7.25 m',
        category: 'powerunit',
      },
      {
        id: 'MUNFITR',
        name: 'Municipal Fire Trucks',
        category: 'powerunit',
      },
      {
        id: 'OGBEDTK',
        name: 'Oil and Gas - Bed Trucks',
        category: 'powerunit',
      },
      {
        id: 'OGOILSW',
        name: 'Oil and Gas - Oilfield Sows',
        category: 'powerunit',
      },
      {
        id: 'OGSERVC',
        name: 'Oil and Gas - Service Rigs',
        category: 'powerunit',
      },
      {
        id: 'OGSRRAH',
        name: 'Oil and Gas - Service Rigs and Rathole Augers Only Equipped with Heavy Front Projected Crane (must exceed 14,000 kg tare weight)',
        category: 'powerunit',
      },
      {
        id: 'PICKRTT',
        name: 'Picker Truck Tractors',
        category: 'powerunit',
      },
      {
        id: 'PLOWBLD',
        name: 'Trucks Equipped with Front or Underbody Plow Blades',
        category: 'powerunit',
      },
      {
        id: 'PUTAXIS',
        name: 'Taxis',
        category: 'powerunit',
      },
      {
        id: 'REGTRCK',
        name: 'Trucks',
        category: 'powerunit',
      },
      {
        id: 'SCRAPER',
        name: 'Scrapers',
        category: 'powerunit',
      },
      {
        id: 'SPAUTHV',
        name: 'Specially Authorized Vehicles',
        category: 'powerunit',
      },
      {
        id: 'STINGER',
        name: 'Truck Tractors - Stinger Steered',
        category: 'powerunit',
      },
      {
        id: 'TOWVEHC',
        name: 'Tow Vehicles',
        category: 'powerunit',
      },
      {
        id: 'TRKTRAC',
        name: 'Truck Tractors',
        category: 'powerunit',
      },
    ],
    trailerTypes: [
      {
        id: 'BOOSTER',
        name: 'Boosters',
        category: 'accessory',
      },
      {
        id: 'DBTRBTR',
        name: 'Tandem/Tridem Drive B-Train (Super B-Train)',
        category: 'trailer',
      },
      {
        id: 'DOLLIES',
        name: 'Dollies',
        category: 'trailer',
      },
      {
        id: 'EXPANDO',
        name: 'Expando Semi-Trailers',
        category: 'trailer',
      },
      {
        id: 'FEBGHSE',
        name: 'Fixed Equipment - Portable Asphalt Baghouses',
        category: 'trailer',
      },
      {
        id: 'FECVYER',
        name: 'Fixed Equipment - Conveyors (Semi-Trailers)',
        category: 'trailer',
      },
      {
        id: 'FECVYPT',
        name: 'Fixed Equipment - Conveyors (Pony Trailers)',
        category: 'trailer',
      },
      {
        id: 'FEDRMMX',
        name: 'Fixed Equipment - Counter Flow Asphalt Drum Mixers',
        category: 'trailer',
      },
      {
        id: 'FEPNYTR',
        name: 'Fixed Equipment - Pony Trailers',
        category: 'trailer',
      },
      {
        id: 'FESEMTR',
        name: 'Fixed Equipment - Semi-Trailers',
        category: 'trailer',
      },
      {
        id: 'FEWHELR',
        name: 'Fixed Equipment - Wheeler Semi-Trailers',
        category: 'wheeler',
      },
      {
        id: 'FLOATTR',
        name: 'Float Trailers',
        category: 'wheeler',
      },
      {
        id: 'FULLLTL',
        name: 'Full Trailers',
        category: 'trailer',
      },
      {
        id: 'HIBOEXP',
        name: 'Semi-Trailers - Hiboys/Expandos',
        category: 'trailer',
      },
      {
        id: 'HIBOFLT',
        name: 'Semi-Trailers - Hiboys/Flat Decks',
        category: 'trailer',
      },
      {
        id: 'JEEPSRG',
        name: 'Jeeps',
        category: 'accessory',
      },
      {
        id: 'LOGDGLG',
        name: 'Legacy Logging Trailer Combinations - Tandem Pole Trailers, Dogloggers',
        category: 'trailer',
      },
      {
        id: 'LOGLGCY',
        name: 'Legacy Logging Trailer Combinations',
        category: 'trailer',
      },
      {
        id: 'LOGFULL',
        name: 'Logging Trailer - Full Trailers, Tri Axle, Quad Axle',
        category: 'trailer',
      },
      {
        id: 'LOGNTAC',
        name: 'Legacy Logging Trailer Combinations - Non-TAC B-Trains',
        category: 'trailer',
      },
      {
        id: 'LOGOWBK',
        name: 'Logging Trailer - Overwidth Bunks',
        category: 'trailer',
      },
      {
        id: 'LOGSMEM',
        name: 'Logging Semi-Trailer - Empty, 3.2 m Bunks',
        category: 'trailer',
      },
      {
        id: 'LOGTNDM',
        name: 'Legacy Logging Trailer Combinations - Single Axle Jeeps, Tandem Axle Pole Trailers, Dogloggers',
        category: 'trailer',
      },
      {
        id: 'LOGTRIX',
        name: 'Legacy Logging Trailer Combinations - Single Axle Jeeps, Tri Axle Trailers',
        category: 'trailer',
      },
      {
        id: 'MHMBSHG',
        name: 'Manufactured Homes, Modular Buildings, Structures and Houseboats (> 5.0 m OAW) with Attached Axles',
        category: 'trailer',
      },
      {
        id: 'MHMBSHL',
        name: 'Manufactured Homes, Modular Buildings, Structures and Houseboats (<= 5.0 m OAW) with Attached Axles',
        category: 'trailer',
      },
      {
        id: 'ODTRLEX',
        name: 'Overdimensional Trailers and Semi-Trailers (For Export)',
        category: 'trailer',
      },
      {
        id: 'OGOSFDT',
        name: 'Oil and Gas - Oversize Oilfield Flat Deck Semi-Trailers',
        category: 'trailer',
      },
      {
        id: 'PLATFRM',
        name: 'Platform Trailers',
        category: 'trailer',
      },
      {
        id: 'PMHWAAX',
        name: 'Park Model Homes with Attached Axles',
        category: 'trailer',
      },
      {
        id: 'POLETRL',
        name: 'Pole Trailers',
        category: 'trailer',
      },
      {
        id: 'PONYTRL',
        name: 'Pony Trailers',
        category: 'trailer',
      },
      {
        id: 'REDIMIX',
        name: 'Ready Mix Concrete Pump Semi-Trailers',
        category: 'trailer',
      },
      {
        id: 'SEMITRL',
        name: 'Semi-Trailers',
        category: 'trailer',
      },
      {
        id: 'STACTRN',
        name: 'Semi-Trailers - A-Trains and C-Trains',
        category: 'trailer',
      },
      {
        id: 'STBTRAN',
        name: 'Semi-Trailers - B-Trains',
        category: 'trailer',
      },
      {
        id: 'STCHIPS',
        name: 'Semi-Trailers - Walled B-Trains (Chip Trucks)',
        category: 'trailer',
      },
      {
        id: 'STCRANE',
        name: 'Semi-Trailers with Crane',
        category: 'trailer',
      },
      {
        id: 'STINGAT',
        name: 'Stinger Steered Automobile Transporters',
        category: 'trailer',
      },
      {
        id: 'STLOGNG',
        name: 'Semi-Trailers - Logging',
        category: 'trailer',
      },
      {
        id: 'STNTSHC',
        name: 'Semi-Trailers - Non-Tac Short Chassis',
        category: 'trailer',
      },
      {
        id: 'STREEFR',
        name: 'Semi-Trailers - Insulated Vans with Reefer/Refrigeration Units',
        category: 'trailer',
      },
      {
        id: 'STROPRT',
        name: 'Steering Trailers - Manned',
        category: 'trailer',
      },
      {
        id: 'STRSELF',
        name: 'Steering Trailers - Self/Remote',
        category: 'trailer',
      },
      {
        id: 'STSDBDK',
        name: 'Semi-Trailers - Single Drop, Double Drop, Step Decks, Lowbed, Expandos, etc.',
        category: 'trailer',
      },
      {
        id: 'STSTEER',
        name: 'Semi-Trailers - Steering Trailers',
        category: 'trailer',
      },
      {
        id: 'STSTNGR',
        name: 'Semi-Trailers - Stinger Steered Automobile Transporters',
        category: 'trailer',
      },
      {
        id: 'STWDTAN',
        name: 'Semi-Trailers - Spread Tandems',
        category: 'trailer',
      },
      {
        id: 'STWHELR',
        name: 'Semi-Trailers - Wheelers',
        category: 'trailer',
      },
      {
        id: 'STWIDWH',
        name: 'Semi-Trailers - Wide Wheelers',
        category: 'trailer',
      },
      {
        id: 'NONEXXX',
        name: 'None',
        category: 'pseudo',
      },
    ],
  },
  commodities: [
    {
      id: 'NONEXXX',
      name: 'None',
      size: {
        powerUnits: [
          {
            type: 'CONCRET',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    l: 15.5,
                  },
                ],
              },
            ],
          },
          {
            type: 'CRAFTAT',
            trailers: [
              {
                type: 'DOLLIES',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.3,
                    l: 25,
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.3,
                    l: 14,
                    regions: [
                      {
                        region: 'PCE',
                        l: 15,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'CRAFTMB',
            trailers: [
              {
                type: 'DOLLIES',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.3,
                    l: 25,
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.3,
                    l: 14,
                    regions: [
                      {
                        region: 'PCE',
                        l: 15,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'DDCKBUS',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.42,
                    regions: [
                      {
                        region: 'LMN',
                        h: 4.3,
                      },
                      {
                        region: 'KTN',
                        h: 4.3,
                      },
                      {
                        region: 'PCE',
                        h: 4.3,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'GRADERS',
            trailers: [
              {
                type: 'FEPNYTR',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.2,
                    h: 4.3,
                    l: 31,
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.5,
                    h: 4.4,
                    l: 12.5,
                    regions: [
                      {
                        region: 'LMN',
                        h: 4.3,
                      },
                      {
                        region: 'KTN',
                        h: 4.3,
                      },
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'BUSTRLR',
            trailers: [
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [{}],
              },
            ],
          },
          {
            type: 'LOGOFFH',
            trailers: [
              {
                type: 'STLOGNG',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 4.4,
                  },
                ],
              },
            ],
          },
          {
            type: 'LCVRMDB',
            trailers: [
              {
                type: 'SEMITRL',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    l: 32,
                    regions: [
                      {
                        region: 'PCE',
                        l: 31,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'LCVTPDB',
            trailers: [
              {
                type: 'SEMITRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    l: 41,
                  },
                ],
              },
            ],
          },
          {
            type: 'LWBTRCT',
            trailers: [
              {
                type: 'SEMITRL',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 2.6,
                    h: 4.15,
                    l: 23,
                  },
                ],
              },
            ],
          },
          {
            type: 'PICKRTT',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    w: 2.6,
                    h: 4.15,
                    l: 16,
                  },
                ],
              },
              {
                type: 'STCRANE',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 2.6,
                    h: 4.15,
                    l: 25,
                  },
                ],
              },
              {
                type: 'STROPRT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 40,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STRSELF',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 36,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'SCRAPER',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    l: 12.5,
                  },
                ],
              },
            ],
          },
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'FECVYER',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 4,
                    rp: 9.5,
                    w: 3.8,
                    h: 4.72,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FEDRMMX',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.72,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FEBGHSE',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 4.26,
                    h: 4.72,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FESEMTR',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.72,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FEWHELR',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'ODTRLEX',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.65,
                  },
                ],
              },
              {
                type: 'REDIMIX',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    h: 4.3,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STREEFR',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.3,
                  },
                ],
              },
              {
                type: 'STNTSHC',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [{}],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        l: 32,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STROPRT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.15,
                    l: 40,
                  },
                ],
              },
              {
                type: 'STRSELF',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    l: 36,
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'FECVYPT',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 4,
                    rp: 9.5,
                    w: 3.2,
                    h: 4.3,
                    l: 31,
                  },
                ],
              },
              {
                type: 'FEPNYTR',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.2,
                    h: 4.3,
                    l: 31,
                  },
                ],
              },
              {
                type: 'FULLLTL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 6.5,
                    w: 3.8,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'MHMBSHL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.9,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'MHMBSHG',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.9,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 16,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.4,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'ODTRLEX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.65,
                  },
                ],
              },
              {
                type: 'PMHWAAX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.9,
                    w: 4.4,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'PLOWBLD',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'DOGLOGG',
      name: 'Doglogger/Sjostrum Trailers (decked)',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 5,
                    l: 13.5,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'GRTBBUK',
      name: 'Grader, Tractor Blades, Buckets',
      size: {
        powerUnits: [
          {
            type: 'GRADERS',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 4.4,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'HAYRACK',
      name: 'Hayrack Semi-Trailer with a Folded Chassis/Empty Piggyback',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STLOGNG',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 5,
                    h: 4.15,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'IMCONTN',
      name: 'Intermodal Containers',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STACTRN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.4,
                    l: 26,
                  },
                ],
              },
              {
                type: 'STBTRAN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.4,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.4,
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.4,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'IMCONWS',
      name: 'Intermodal Containers without Sides',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 4.4,
                    h: 4.72,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'LPBOOMS',
      name: 'Logs, Poles And Boomsticks (Up To 20.1)',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'FULLLTL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 2.9,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'LOGLGCY',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 5,
                    w: 2.6,
                    l: 25,
                  },
                ],
              },
              {
                type: 'POLETRL',
                jeep: true,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 2.9,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'STACTRN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 2.9,
                    l: 26,
                  },
                ],
              },
              {
                type: 'STBTRAN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 2.9,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 2.9,
                    l: 25,
                  },
                ],
              },
              {
                type: 'STLOGNG',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 2.9,
                    l: 25,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'LPBOOML',
      name: 'Logs, Poles And Boomsticks (Over 20.1)',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'LOGFULL',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 10,
                    l: 40,
                  },
                ],
              },
              {
                type: 'POLETRL',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 8,
                    rp: 9,
                    l: 40,
                  },
                ],
              },
              {
                type: 'STROPRT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 10,
                    l: 40,
                  },
                ],
              },
              {
                type: 'STRSELF',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 10,
                    l: 36,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'MFHOMES',
      name: 'Manufactured Homes, Modular Buildings, Structures and Houseboats (<= 5.0 m OAW)',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'SEMITRL',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 7.5,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 7.5,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'DOLLIES',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.9,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FLOATTR',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.9,
                    h: 4.57,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.9,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'MFHOMEL',
      name: 'Manufactured Homes, Modular Buildings, Structures and Houseboats (> 5.0 m OAW)',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'SEMITRL',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 7.5,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 7.5,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'DOLLIES',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.9,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FLOATTR',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.9,
                    h: 4.57,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.9,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                        l: 36,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'PARKMHS',
      name: 'Park Model Homes',
      size: {
        powerUnits: [
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'DOLLIES',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.9,
                    w: 4.4,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FLOATTR',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.9,
                    w: 4.4,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.9,
                    w: 4.4,
                    h: 4.88,
                    l: 31.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'PIPESTL',
      name: 'Pipe And Steel Products (Rebar, Pilings, Reinforcing Steel, Etc.)',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'HIBOEXP',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 31,
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'STSTEER',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 36,
                  },
                ],
              },
              {
                type: 'STROPRT',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 40,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'REDUCBL',
      name: 'Reducible Loads',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STLOGNG',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.15,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'PLATFRM',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'SEMITRL',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STACTRN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 26,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STBTRAN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOEXP',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSTEER',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STWHELR',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STWIDWH',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STCRANE',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STROPRT',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 40,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STRSELF',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 36,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'PICKRTT',
            trailers: [
              {
                type: 'SEMITRL',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOEXP',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    w: 3.2,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'STINGER',
            trailers: [
              {
                type: 'SEMITRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 1.2,
                    h: 4.3,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSTNGR',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 1.2,
                    h: 4.3,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'DOLLIES',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.4,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FULLLTL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.4,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 16,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.4,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.4,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'SCRAPER',
      name: 'Scraper on Dollies',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'DOLLIES',
                jeep: true,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.3,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.4,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'OILFILD',
      name: 'Oil Field Equipment',
      size: {
        powerUnits: [
          {
            type: 'OGBEDTK',
            trailers: [
              {
                type: 'EXPANDO',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    h: 4.3,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 5,
                    w: 3.3,
                    h: 4.3,
                    l: 14,
                  },
                ],
              },
              {
                type: 'OGOSFDT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.3,
                    h: 4.3,
                    l: 23,
                  },
                ],
              },
            ],
          },
          {
            type: 'OGOILSW',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 5,
                    w: 3.2,
                    h: 4.3,
                    l: 15,
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 25,
                  },
                ],
              },
            ],
          },
          {
            type: 'OGSERVC',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.3,
                    l: 15,
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.3,
                    l: 23,
                  },
                ],
              },
            ],
          },
          {
            type: 'OGSRRAH',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 6.5,
                    w: 2.9,
                    h: 4.15,
                    l: 15.5,
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 10,
                    rp: 6.5,
                    w: 2.9,
                    h: 4.15,
                    l: 23,
                  },
                ],
              },
            ],
          },
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'OGOSFDT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.3,
                    h: 4.3,
                    l: 23,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'JPTRLOG',
      name: 'Tandem Jeep/Pole Trailer Loaded on Logging Truck',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 5,
                    w: 2.9,
                    h: 4.3,
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 5,
                    w: 2.9,
                    h: 4.3,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'TOWDISB',
      name: 'Tow Trucks And Disabled Vehicles',
      size: {
        powerUnits: [
          {
            type: 'TOWVEHC',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.3,
                    l: 27.5,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'TRQDLOG',
      name: 'Tri-Axle or Quad Axle Full Trailer Loaded on Logging Truck',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 5,
                    h: 4.3,
                    l: 13.5,
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 5,
                    h: 4.3,
                    l: 13.5,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'WOODCHP',
      name: 'Wood Chips, Residuals',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STBTRAN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    h: 4.45,
                    l: 27.5,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'EMPTYXX',
      name: 'Empty',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'LOGOWBK',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 0,
                    rp: 0,
                    w: 3.2,
                  },
                ],
              },
              {
                type: 'PLATFRM',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOEXP',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    l: 31,
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.2,
                    l: 31,
                  },
                ],
              },
              {
                type: 'STWHELR',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STWIDWH',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STCRANE',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'PICKRTT',
            trailers: [
              {
                type: 'OGOSFDT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.2,
                    h: 4.3,
                    l: 23,
                  },
                ],
              },
              {
                type: 'PLATFRM',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOEXP',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        l: 27.5,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STWHELR',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STWIDWH',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STCRANE',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.2,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'GRBBINS',
      name: 'Garbage Bins',
      size: {
        powerUnits: [
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'FULLLTL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'LAMBEAM',
      name: 'Laminated Beams',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'POLETRL',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    l: 40,
                  },
                ],
              },
              {
                type: 'HIBOEXP',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    l: 31,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'HAYLREC',
      name: 'Hay Bales Large Rectangular',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STACTRN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.05,
                    h: 4.3,
                    l: 26,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STBTRAN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.05,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.05,
                    h: 4.4,
                    regions: [
                      {
                        region: 'LMN',
                        h: 4.3,
                      },
                      {
                        region: 'KTN',
                        h: 4.3,
                      },
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.05,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'FULLLTL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.05,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.05,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.05,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'HAYROND',
      name: 'Hay Bales Round',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STACTRN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.5,
                    h: 4.3,
                    l: 26,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STBTRAN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.5,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'FULLLTL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'HAYSREC',
      name: 'Hay Bales Small Rectangular',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STACTRN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.05,
                    h: 4.3,
                    l: 26,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STBTRAN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.05,
                    h: 4.3,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.05,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.05,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'FULLLTL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.05,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.05,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.05,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'BRGBEAM',
      name: 'Bridge Beams',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'POLETRL',
                jeep: true,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    l: 31,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'NONREDU',
      name: 'Non-Reducible Loads',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STLOGNG',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 3.8,
                    h: 4.15,
                    l: 27.5,
                  },
                ],
              },
              {
                type: 'PLATFRM',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'SEMITRL',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STACTRN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.4,
                    l: 26,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STBTRAN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.4,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOEXP',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.4,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.4,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSTEER',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STWHELR',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STWIDWH',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STCRANE',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STROPRT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 40,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STRSELF',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 36,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'PICKRTT',
            trailers: [
              {
                type: 'OGOSFDT',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.3,
                    h: 4.3,
                    l: 23,
                  },
                ],
              },
              {
                type: 'SEMITRL',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    w: 5,
                    h: 4.88,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOEXP',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    w: 5,
                    h: 4.4,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    w: 5,
                    h: 4.4,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    w: 5,
                    h: 4.88,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSTEER',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STWHELR',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STWIDWH',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STCRANE',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 27.5,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STROPRT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 40,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STRSELF',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 5,
                    h: 4.88,
                    l: 36,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'STINGER',
            trailers: [
              {
                type: 'SEMITRL',
                jeep: false,
                booster: false,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 1.2,
                    h: 4.88,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSTNGR',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 1.2,
                    h: 4.88,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'DOLLIES',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.5,
                    w: 5,
                    h: 4.88,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FULLLTL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.5,
                    w: 5,
                    h: 4.88,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.5,
                    w: 5,
                    h: 4.88,
                    l: 16,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 6.5,
                    w: 5,
                    h: 4.88,
                    l: 25,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'AUTOCRR',
      name: 'Auto Carrier, Campers And Boats (Stinger Steered Transporters Only)',
      size: {
        powerUnits: [
          {
            type: 'STINGER',
            trailers: [
              {
                type: 'STSTNGR',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 1,
                    rp: 1.2,
                    h: 4.4,
                    l: 25,
                    regions: [
                      {
                        region: 'LMN',
                        h: 4.3,
                      },
                      {
                        region: 'KTN',
                        h: 4.3,
                      },
                      {
                        region: 'PCE',
                        h: 4.88,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'HAYRNPR',
      name: 'Hay Bales (Round) Peace River Only',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'STACTRN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.5,
                    h: 4.3,
                    l: 26,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STBTRAN',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'HIBOFLT',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'FULLLTL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.5,
                    h: 4.3,
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.84,
                        h: 4.8,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'BRSHCUT',
      name: 'Brushcutters (Peace Only)',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'SEMITRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    regions: [
                      {
                        region: 'PCE',
                        w: 4.57,
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'STSDBDK',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    regions: [
                      {
                        region: 'PCE',
                        w: 4.57,
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'NONEXXX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    regions: [
                      {
                        region: 'PCE',
                        w: 4.57,
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'PONYTRL',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    regions: [
                      {
                        region: 'PCE',
                        w: 3.8,
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'FIXEDEQ',
      name: 'Fixed Equipment',
      size: {
        powerUnits: [
          {
            type: 'TRKTRAC',
            trailers: [
              {
                type: 'FECVYER',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 4,
                    rp: 9.5,
                    w: 3.8,
                    h: 4.72,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FEDRMMX',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.72,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FEBGHSE',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 4.26,
                    h: 4.72,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FESEMTR',
                jeep: true,
                booster: true,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.72,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FEWHELR',
                jeep: true,
                booster: true,
                selfIssue: false,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.72,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'REGTRCK',
            trailers: [
              {
                type: 'FECVYPT',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 4,
                    rp: 9.5,
                    w: 3.2,
                    h: 4.3,
                    l: 31,
                  },
                ],
              },
              {
                type: 'FEDRMMX',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 3.8,
                    h: 4.72,
                    l: 31,
                    regions: [
                      {
                        region: 'PCE',
                        h: 5.33,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'FEPNYTR',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    rp: 4,
                    w: 3.2,
                    h: 4.3,
                    l: 31,
                  },
                ],
              },
              {
                type: 'FEBGHSE',
                jeep: false,
                booster: false,
                selfIssue: true,
                sizeDimensions: [
                  {
                    fp: 3,
                    rp: 6.5,
                    w: 4.26,
                    h: 4.72,
                    l: 31,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  globalSizeDefaults: {
    fp: 3,
    rp: 6.5,
    w: 2.6,
    h: 4.15,
    l: 31,
  },
};
