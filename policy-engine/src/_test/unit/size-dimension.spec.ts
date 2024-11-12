import { Policy } from '../../policy-engine';
import { stosPolicyConfig } from '../policy-config/stos-vehicle-config.sample';

describe('Permit Engine Size Dimension Functions', () => {
  const policy: Policy = new Policy(stosPolicyConfig);

  it('should assume all regions if none are supplied', async () => {
    // This configuration has minimum values pulled from multiple regions
    const sizeDimension = policy.getSizeDimension('STOS', 'EMPTYXX', [
      'TRKTRAC',
      'JEEPSRG',
      'HIBOEXP',
    ]);
    expect(sizeDimension?.fp).toBe(3);
    expect(sizeDimension?.rp).toBe(6.5);
    expect(sizeDimension?.l).toBe(31);
    expect(sizeDimension?.h).toBeUndefined();
    expect(sizeDimension?.w).toBeUndefined();
  });

  it('should retrieve correct values for a single specified region', async () => {
    const sizeDimension = policy.getSizeDimension(
      'STOS',
      'EMPTYXX',
      ['TRKTRAC', 'JEEPSRG', 'PLATFRM'],
      ['PCE'],
    );
    expect(sizeDimension?.fp).toBeUndefined();
    expect(sizeDimension?.rp).toBeUndefined();
    expect(sizeDimension?.l).toBe(27.5);
    expect(sizeDimension?.h).toBe(5.33);
    expect(sizeDimension?.w).toBe(3.2);
  });

  it('should throw an error if an invalid permit type is specified', async () => {
    expect(() => {
      policy.getSizeDimension('_INVALID', 'EMPTYXX', [
        'TRKTRAC',
        'JEEPSRG',
        'STWHELR',
      ]);
    }).toThrow();
  });

  it('should return null if an invalid configuration is specified', async () => {
    const sizeDimension = policy.getSizeDimension('STOS', 'EMPTYXX', [
      '_INVALID',
      'JEEPSRG',
      'STWHELR',
    ]);
    expect(sizeDimension).toBeNull();
  });

  it('should return null if no dimensionable trailer is specified', async () => {
    const sizeDimension = policy.getSizeDimension('STOS', 'EMPTYXX', [
      'TRKTRAC',
      'JEEPSRG',
    ]);
    expect(sizeDimension).toBeNull();
  });

  it('should throw an error if an invalid commodity is specified', async () => {
    expect(() => {
      policy.getSizeDimension('STOS', '_INVALID', ['TRKTRAC', 'JEEPSRG']);
    }).toThrow();
  });
});
