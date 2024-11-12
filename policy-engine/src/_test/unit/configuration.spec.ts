import { Policy } from '../../policy-engine';
import { stosPolicyConfig } from '../policy-config/stos-vehicle-config.sample';

describe('Permit Engine Oversize Configuration Functions', () => {
  const policy: Policy = new Policy(stosPolicyConfig);

  it('should retrieve all permittable power unit types for STOS', async () => {
    const puTypes = policy.getPermittablePowerUnitTypes('STOS', 'EMPTYXX');
    expect(puTypes.size).toBe(2);
    expect(puTypes.keys()).toContain('TRKTRAC');
    expect(puTypes.keys()).toContain('PICKRTT');
  });

  it('should throw an error for invalid permit type', async () => {
    expect(() => {
      policy.getPermittablePowerUnitTypes('_INVALID', 'EMPTYXX');
    }).toThrow();
  });

  it('should return an empty map for invalid commodity', async () => {
    const puTypes = policy.getPermittablePowerUnitTypes('STOS', '_INVALID');
    expect(puTypes.size).toBe(0);
  });
});

describe('Permit Engine Get Next Permittable Vehicles', () => {
  const policy: Policy = new Policy(stosPolicyConfig);

  it('should return permittable power units with empty current configuration', async () => {
    const vehicles = policy.getNextPermittableVehicles('STOS', 'LAMBEAM', []);
    expect(vehicles.size).toBe(1);
    expect(vehicles.keys()).toContain('TRKTRAC');
  });

  it('should return jeep and a trailer when current config is just power unit', async () => {
    const vehicles = policy.getNextPermittableVehicles('STOS', 'LAMBEAM', [
      'TRKTRAC',
    ]);
    expect(vehicles.size).toBe(3);
    expect(vehicles.keys()).toContain('JEEPSRG');
    expect(vehicles.keys()).toContain('POLETRL');
    expect(vehicles.keys()).toContain('HIBOEXP');
  });

  it('should return jeep and a trailer when current config is power unit and jeep', async () => {
    const vehicles = policy.getNextPermittableVehicles('STOS', 'LAMBEAM', [
      'TRKTRAC',
      'JEEPSRG',
    ]);
    expect(vehicles.size).toBe(3);
    expect(vehicles.keys()).toContain('JEEPSRG');
    expect(vehicles.keys()).toContain('POLETRL');
    expect(vehicles.keys()).toContain('HIBOEXP');
  });

  it('should return booster when current config is power unit and trailer', async () => {
    const vehicles = policy.getNextPermittableVehicles('STOS', 'LAMBEAM', [
      'TRKTRAC',
      'POLETRL',
    ]);
    expect(vehicles.size).toBe(1);
    expect(vehicles.keys()).toContain('BOOSTER');
  });

  it('should return empty map when current configuration is invalid', async () => {
    const vehicles = policy.getNextPermittableVehicles('STOS', 'LAMBEAM', [
      'TRKTRAC',
      '_INVALID',
    ]);
    expect(vehicles.size).toBe(0);
  });
});

describe('Permit Engine Configuration Validation', () => {
  const policy: Policy = new Policy(stosPolicyConfig);

  it('should return true for a valid configuration with power unit and trailer', async () => {
    const isValid = policy.isConfigurationValid('STOS', 'LAMBEAM', [
      'TRKTRAC',
      'POLETRL',
    ]);
    expect(isValid).toBe(true);
  });

  it('should return true for a valid configuration with power unit and trailer and jeep and booster', async () => {
    const isValid = policy.isConfigurationValid('STOS', 'LAMBEAM', [
      'TRKTRAC',
      'JEEPSRG',
      'POLETRL',
      'BOOSTER',
    ]);
    expect(isValid).toBe(true);
  });

  it('should return false for a configuration out of order', async () => {
    const isValid = policy.isConfigurationValid('STOS', 'LAMBEAM', [
      'TRKTRAC',
      'POLETRL',
      'JEEPSRG',
      'BOOSTER',
    ]);
    expect(isValid).toBe(false);
  });

  it('should throw an error for an invalid permit type', async () => {
    expect(() => {
      policy.isConfigurationValid('_INVALID', 'LAMBEAM', [
        'TRKTRAC',
        'POLETRL',
      ]);
    }).toThrow();
  });

  it('should throw an error for an invalid commodity', async () => {
    expect(() => {
      policy.isConfigurationValid('STOS', '_INVALID', ['TRKTRAC', 'POLETRL']);
    }).toThrow();
  });

  it('should return false for a configuration missing a trailer', async () => {
    const isValid = policy.isConfigurationValid('STOS', 'LAMBEAM', [
      'TRKTRAC',
      'JEEPSRG',
    ]);
    expect(isValid).toBe(false);
  });

  it('should return true for a partial configuration missing a trailer', async () => {
    const isValid = policy.isConfigurationValid(
      'STOS',
      'LAMBEAM',
      ['TRKTRAC', 'JEEPSRG'],
      true,
    );
    expect(isValid).toBe(true);
  });

  it('should throw an error for a permit type not requiring commodity', async () => {
    expect(() => {
      policy.isConfigurationValid('TROS', 'LAMBEAM', ['TRKTRAC']);
    }).toThrow();
  });
});
