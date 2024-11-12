import { Policy } from 'onroute-policy-engine';
import { completePolicyConfig } from '../_test/policy-config/complete-in-progress.sample';

function start() {
  const policy: Policy = new Policy(completePolicyConfig);
  console.log(JSON.stringify(policy.policyDefinition));
  /*

  console.log('***ALL COMMODITIES***');
  const allCommodities = policy.getCommodities();
  console.log(
    JSON.stringify(Array.from(allCommodities.entries()), null, '   '),
  );

  console.log('***COMMODITIES FOR STOS***');
  const stosCommodities = policy.getCommodities('STOS');
  console.log(
    JSON.stringify(Array.from(stosCommodities.entries()), null, '   '),
  );

  console.log('***POWER UNITS PERMITTABLE FOR STOS AND EMPTY COMMODITY***');
  const puTypesEmpty = policy.getPermittablePowerUnitTypes('STOS', 'EMPTYXX');
  console.log(JSON.stringify(Array.from(puTypesEmpty.entries()), null, '   '));

  console.log(
    '***POWER UNITS PERMITTABLE FOR STOS AND BRIDGE BEAMS COMMODITY***',
  );
  const puTypesBridgeBeams = policy.getPermittablePowerUnitTypes(
    'STOS',
    'BRGBEAM',
  );
  console.log(
    JSON.stringify(Array.from(puTypesBridgeBeams.entries()), null, '   '),
  );

  console.log(
    '***PERMITTABLE NEXT VEHICLES WITH EMPTY CONFIGURATION, STOS AND EMPTY***',
  );
  const vehicleTypes1 = policy.getNextPermittableVehicles(
    'STOS',
    'EMPTYXX',
    [],
  );
  console.log(JSON.stringify(Array.from(vehicleTypes1.entries()), null, '   '));

  console.log(
    '***PERMITTABLE NEXT VEHICLES WITH TRUCK TRACTOR AND JEEP, STOS AND EMPTY***',
  );
  const vehicleTypes2 = policy.getNextPermittableVehicles('STOS', 'EMPTYXX', [
    'TRKTRAC',
    'JEEPSRG',
  ]);
  console.log(JSON.stringify(Array.from(vehicleTypes2.entries()), null, '   '));

  console.log(
    '***MAX SIZE FOR TRUCK TRACTOR, JEEP, HIBOEXP, STOS AND EMPTYXX***',
  );
  const sizeDimension = policy.getSizeDimension('STOS', 'EMPTYXX', ['TRKTRAC', 'JEEPSRG', 'HIBOEXP']);
  console.log(JSON.stringify(sizeDimension, null, '   '));

  console.log(
    '***MAX SIZE FOR TRUCK TRACTOR, JEEP, HIBOEXP, STOS AND EMPTYXX IN PEACE***',
  );
  const sizeDimensionPeace = policy.getSizeDimension('STOS', 'EMPTYXX', ['TRKTRAC', 'JEEPSRG', 'HIBOEXP'], ['PCE']);
  console.log(JSON.stringify(sizeDimensionPeace, null, '   '));

  console.log(
    '***MAX SIZE FOR TRUCK TRACTOR, JEEP, HIBOEXP, STOS AND EMPTYXX IN PEACE,BC DEFAULT***',
  );
  const sizeDimensionPeaceBC = policy.getSizeDimension('STOS', 'EMPTYXX', ['TRKTRAC', 'JEEPSRG', 'HIBOEXP'], ['PCE','BCD']);
  console.log(JSON.stringify(sizeDimensionPeaceBC, null, '   '));
  */
}

start();
