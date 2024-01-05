import { factory, nullable, primaryKey } from "@mswjs/data";
import {
  PowerUnit,
  Trailer,
  VEHICLE_TYPES,
} from "../../../../../../manageVehicles/types/Vehicle";

import {
  TROS_INELIGIBLE_POWERUNITS,
  TROS_INELIGIBLE_TRAILERS,
} from "../../../../../constants/termOversizeConstants";

let powerUnitId = 1;
let trailerId = 1;

const vehicleSourceDef = factory({
  powerUnit: {
    powerUnitId: primaryKey((): string => `${powerUnitId++}`),
    companyId: Number,
    unitNumber: nullable(String),
    plate: String,
    year: nullable(Number),
    make: String,
    vin: String,
    licensedGvw: nullable(Number),
    steerAxleTireSize: nullable(Number),
    createdDateTime: nullable(String),
    updatedDateTime: nullable(String),
    provinceCode: String,
    countryCode: String,
    powerUnitTypeCode: String,
    vehicleType: (): string => VEHICLE_TYPES.POWER_UNIT,
  },
  trailer: {
    trailerId: primaryKey((): string => `${trailerId++}`),
    companyId: Number,
    unitNumber: nullable(String),
    plate: String,
    year: nullable(Number),
    make: String,
    vin: String,
    emptyTrailerWidth: nullable(Number),
    createdDateTime: nullable(String),
    updatedDateTime: nullable(String),
    provinceCode: String,
    countryCode: String,
    trailerTypeCode: String,
    vehicleType: (): string => VEHICLE_TYPES.TRAILER,
  },
  trailerSubType: {
    typeCode: primaryKey(String),
    type: String,
    description: String,
  },
  powerUnitSubType: {
    typeCode: primaryKey(String),
    type: String,
    description: String,
  },
});

export const getDefaultPowerUnits = () => [
  {
    companyId: 74,
    unitNumber: "61",
    plate: "ABCDEF",
    year: 2001,
    make: "Freightliner",
    vin: "123456",
    licensedGvw: 15527,
    steerAxleTireSize: 330,
    createdDateTime: "2023-06-14T22:34:26.890Z",
    updatedDateTime: "2023-06-14T22:34:26.890Z",
    provinceCode: "BC",
    countryCode: "CA",
    powerUnitTypeCode: "PUTYPEB",
  },
];

export const getDefaultTrailers = () => [
  {
    companyId: 74,
    unitNumber: "3",
    plate: "A1B23C",
    year: 2014,
    make: "GMC",
    vin: "234567",
    emptyTrailerWidth: 3.7,
    createdDateTime: "2023-06-14T22:34:27.030Z",
    updatedDateTime: "2023-06-14T22:34:27.030Z",
    provinceCode: "OR",
    countryCode: "US",
    trailerTypeCode: "TRAILTC",
  },
];

export const getDefaultPowerUnitSubTypes = () => [
  {
    typeCode: "PUTYPEA",
    type: "Power Unit Type A",
    description: "Power Unit Type A.",
  },
  {
    typeCode: "PUTYPEB",
    type: "Power Unit Type B",
    description: "Power Unit Type B.",
  },
  {
    typeCode: "PUTYPEC",
    type: "Power Unit Type C",
    description: "Power Unit Type C.",
  },
  { ...TROS_INELIGIBLE_POWERUNITS[0] },
];

export const getDefaultTrailerSubTypes = () => [
  {
    typeCode: "TRAILTA",
    type: "Trailer Type A",
    description: "Trailer Type A.",
  },
  {
    typeCode: "TRAILTB",
    type: "Trailer Type B",
    description: "Trailer Type B.",
  },
  {
    typeCode: "TRAILTC",
    type: "Trailer Type C",
    description: "Trailer Type C.",
  },
  { ...TROS_INELIGIBLE_TRAILERS[0] },
];

export const createPowerUnit = (powerUnit: PowerUnit) => {
  try {
    return vehicleSourceDef.powerUnit.create({ ...powerUnit });
  } catch (e) {
    console.error(e);
  }
};
export const updatePowerUnit = (powerUnitId: string, powerUnit: PowerUnit) => {
  try {
    return vehicleSourceDef.powerUnit.update({
      where: {
        powerUnitId: {
          equals: powerUnitId,
        },
      },
      data: {
        ...powerUnit,
      },
    });
  } catch (e) {
    console.error(e);
  }
};
export const findPowerUnit = (vin: string) => {
  return vehicleSourceDef.powerUnit.findFirst({
    where: {
      vin: {
        equals: vin,
      },
    },
  });
};
export const createTrailer = (trailer: Trailer) => {
  try {
    return vehicleSourceDef.trailer.create({ ...trailer });
  } catch (e) {
    console.error(e);
  }
};
export const updateTrailer = (trailerId: string, trailer: Trailer) => {
  try {
    return vehicleSourceDef.trailer.update({
      where: {
        trailerId: {
          equals: trailerId,
        },
      },
      data: {
        ...trailer,
      },
    });
  } catch (e) {
    console.error(e);
  }
};
export const findTrailer = (vin: string) => {
  return vehicleSourceDef.trailer.findFirst({
    where: {
      vin: {
        equals: vin,
      },
    },
  });
};

const initVehicleSource = () => {
  getDefaultPowerUnitSubTypes().forEach((powerUnitSubType) => {
    vehicleSourceDef.powerUnitSubType.create(powerUnitSubType);
  });
  getDefaultTrailerSubTypes().forEach((trailerSubType) => {
    vehicleSourceDef.trailerSubType.create(trailerSubType);
  });
  getDefaultPowerUnits().forEach((powerUnit) => {
    createPowerUnit(powerUnit);
  });
  getDefaultTrailers().forEach((trailer) => {
    createTrailer(trailer);
  });
};

export const getAllPowerUnits = () => vehicleSourceDef.powerUnit.getAll();
export const getAllTrailers = () => vehicleSourceDef.trailer.getAll();
export const getAllPowerUnitSubTypes = () =>
  vehicleSourceDef.powerUnitSubType.getAll();
export const getAllTrailerSubTypes = () => vehicleSourceDef.trailerSubType.getAll();

export const resetVehicleSource = () => {
  powerUnitId = 1;
  trailerId = 1;
  vehicleSourceDef.powerUnit.deleteMany({
    where: {
      powerUnitId: {
        contains: "",
      },
    },
  });
  vehicleSourceDef.trailer.deleteMany({
    where: {
      trailerId: {
        contains: "",
      },
    },
  });
  vehicleSourceDef.powerUnitSubType.deleteMany({
    where: {
      typeCode: {
        contains: "",
      },
    },
  });
  vehicleSourceDef.trailerSubType.deleteMany({
    where: {
      typeCode: {
        contains: "",
      },
    },
  });
  initVehicleSource();
};
