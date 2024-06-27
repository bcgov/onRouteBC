import PolicyDefinition from '../../src/interface/policy-definition.interface';

export const masterPolicyConfig: PolicyDefinition = {
  version: '2024.03.18.001',
  geographicRegions: [],
  commonRules: [
    {
      conditions: {
        not: {
          fact: 'permitData.companyName',
          operator: 'stringMinimumLength',
          value: 1,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Company is required',
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData.contactDetails.firstName',
          operator: 'stringMinimumLength',
          value: 1,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Contact first name is required',
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData.contactDetails.lastName',
          operator: 'stringMinimumLength',
          value: 1,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Contact last name is required',
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData.contactDetails.phone1',
          operator: 'stringMinimumLength',
          value: 1,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Contact phone number is required',
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData.contactDetails.email',
          operator: 'stringMinimumLength',
          value: 1,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Company contact email is required',
        },
      },
    },
    {
      conditions: {
        any: [
          {
            fact: 'permitData.startDate',
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
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData.vehicleDetails.vin',
          operator: 'regex',
          value: '^[a-zA-Z0-9]{6}$',
        },
      },
      event: {
        type: 'violation',
        params: {
          message:
            'Vehicle Identification Number (vin) must be 6 alphanumeric characters',
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData.vehicleDetails.plate',
          operator: 'stringMinimumLength',
          value: 1,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Vehicle plate is required',
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData.vehicleDetails.make',
          operator: 'stringMinimumLength',
          value: 1,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Vehicle make is required',
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData.vehicleDetails.year',
          operator: 'greaterThan',
          value: 1900,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Vehicle year is required',
        },
      },
    },
    {
      conditions: {
        not: {
          fact: 'permitData.vehicleDetails.countryCode',
          operator: 'stringMinimumLength',
          value: 1,
        },
      },
      event: {
        type: 'violation',
        params: {
          message: 'Vehicle country of registration is required',
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
      allowedVehicles: ['BOOSTER', 'DOLLIES', 'EXPANDO', 'FEBGHSE', 'FECVYER', 'FEDRMMX', 'FEPNYTR', 'FESEMTR', 'FEWHELR', 'FLOATTR', 'FULLLTL', 'HIBOEXP', 'HIBOFLT', 'JEEPSRG', 'LOGDGLG', 'LOGFULL', 'LOGNTAC', 'LOGOWBK', 'LOGSMEM', 'LOGTNDM', 'LOGTRIX', 'ODTRLEX', 'OGOSFDT', 'PLATFRM', 'POLETRL', 'PONYTRL', 'REDIMIX', 'SEMITRL', 'STBTRAN', 'STCHIPS', 'STCRANE', 'STINGAT', 'STLOGNG', 'STNTSHC', 'STREEFR', 'STSDBDK', 'STSTNGR', 'STWHELR', 'STWIDWH', 'BUSTRLR', 'CONCRET', 'DDCKBUS', 'GRADERS', 'LOGGING', 'LOGOFFH', 'LWBTRCT', 'OGBEDTK', 'OGOILSW', 'PICKRTT', 'PLOWBLD', 'REGTRCK', 'STINGER', 'TOWVEHC', 'TRKTRAC'],
      rules: [
        {
          conditions: {
            all: [
              {
                not: {
                  fact: 'permitData.permitDuration',
                  operator: 'in',
                  value: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
                },
              },
              {
                not: {
                  fact: 'permitData.permitDuration',
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
            },
          },
        },
        {
          conditions: {
            not: {
              fact: 'permitData.vehicleDetails.vehicleSubType',
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
            },
          },
        },
      ],
    },
    {
      id: 'TROW',
      name: 'Term Overweight',
      routingRequired: false,
      weightDimensionRequired: false,
      sizeDimensionRequired: false,
      commodityRequired: false,
      allowedVehicles: ['DOLLIES', 'FEBGHSE', 'FECVYER', 'FEDRMMX', 'FEPNYTR', 'FESEMTR', 'FEWHELR', 'REDIMIX', 'CONCRET', 'CRAFTAT', 'CRAFTMB', 'GRADERS', 'MUNFITR', 'OGOILSW', 'OGSERVC', 'OGSRRAH', 'PICKRTT', 'TOWVEHC'],
      rules: [
        {
          conditions: {
            all: [
              {
                not: {
                  fact: 'permitData.permitDuration',
                  operator: 'in',
                  value: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
                },
              },
              {
                not: {
                  fact: 'permitData.permitDuration',
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
            },
          },
        },
        {
          conditions: {
            not: {
              fact: 'permitData.vehicleDetails.vehicleSubType',
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
    frontProjection: 3,
    rearProjection: 6.5,
    width: 2.6,
    height: 4.15,
    length: 31,
  },
  vehicleCategories: {
    trailerCategories: [],
    powerUnitCategories: [],
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
        name: 'Intercity Buses (Pulling Pony Trailers)',
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
        category: 'trailer',
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
        name: 'Fixed Equipment - Conveyors',
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
        category: 'trailer',
      },
      {
        id: 'LOGDGLG',
        name: 'Legacy Logging Trailer Combinations - Tandem Pole Trailers, Dogloggers',
        category: 'trailer',
      },
      {
        id: 'LOGFULL',
        name: 'Logging Trailers - Full Trailers, Tri Axle, Quad Axle',
        category: 'trailer',
      },
      {
        id: 'LOGNTAC',
        name: 'Legacy Logging Trailer Combinations - Non-TAC B-Trains',
        category: 'trailer',
      },
      {
        id: 'LOGOWBK',
        name: 'Logging Trailers - Overwidth Bunks',
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
    ],
  },
  commodities: [],
};
