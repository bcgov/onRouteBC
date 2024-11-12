import { Policy } from 'onroute-policy-engine';
import { trosOnly } from '../policy-config/tros-only.sample';
import { trosNoAllowedVehicles } from '../policy-config/tros-no-allowed-vehicles.sample';
import { completePolicyConfig } from '../policy-config/complete-in-progress.sample';
import { trosNoParamsSample } from '../policy-config/tros-no-params.sample';
import { testStos } from '../permit-app/test-stos';
import { validTros30Day } from '../permit-app/valid-tros-30day';
import { validTrow120Day } from '../permit-app/valid-trow-120day';
import { allEventTypes } from '../policy-config/all-event-types.sample';
import dayjs from 'dayjs';
import { PermitAppInfo } from '../../enum/permit-app-info';
import { ValidationResultCode } from '../../enum/validation-result-code';

describe('Permit Engine Constructor', () => {
  it('should construct without error', () => {
    expect(() => new Policy(trosOnly)).not.toThrow();
  });

  it('should assign policy definition correctly', () => {
    const policy: Policy = new Policy(trosOnly);
    expect(policy.policyDefinition).toBeTruthy();
  });
});

describe('Policy Engine Validator', () => {
  const policy: Policy = new Policy(trosOnly);

  it('should validate TROS successfully', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(
      PermitAppInfo.PermitDateFormat.toString(),
    );

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(0);
  });

  it('should raise violation for start date in the past', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));
    // Set startDate to yesterday
    permit.permitData.startDate = dayjs()
      .subtract(1, 'day')
      .format(PermitAppInfo.PermitDateFormat.toString());

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(1);
  });

  it('should raise violation for invalid permit type', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(
      PermitAppInfo.PermitDateFormat.toString(),
    );
    permit.permitType = '__INVALID';

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(1);
  });

  it('should raise violation for invalid vehicle type', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(
      PermitAppInfo.PermitDateFormat.toString(),
    );
    // Set an invalid vehicle type
    permit.permitData.vehicleDetails.vehicleSubType = '__INVALID';

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(1);
  });

  it('should raise violation if no allowed vehicles are specified', async () => {
    const policyNoVehicles: Policy = new Policy(trosNoAllowedVehicles);
    const permit = JSON.parse(JSON.stringify(validTros30Day));

    const validationResult = await policyNoVehicles.validate(permit);
    expect(validationResult.violations).toHaveLength(1);
  });

  it('should return the correct validation code', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(
      PermitAppInfo.PermitDateFormat.toString(),
    );
    // Set an invalid companyName
    permit.permitData.companyName = '';

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(1);
    expect(validationResult.violations[0].code).toBe(
      ValidationResultCode.FieldValidationError.toString(),
    );
  });

  it('should return the correct field reference', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(
      PermitAppInfo.PermitDateFormat.toString(),
    );
    // Set an invalid companyName
    permit.permitData.companyName = '';

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(1);
    expect(validationResult.violations[0].fieldReference).toBe(
      'permitData.companyName',
    );
  });
});

describe('Master Policy Configuration Validator', () => {
  const policy: Policy = new Policy(completePolicyConfig);

  it('should validate TROS successfully', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(
      PermitAppInfo.PermitDateFormat.toString(),
    );

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(0);
  });

  it('should validate TROW successfully', async () => {
    const permit = JSON.parse(JSON.stringify(validTrow120Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(
      PermitAppInfo.PermitDateFormat.toString(),
    );

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(0);
  });

  it('should validate STOS successfully', async () => {
    const permit = JSON.parse(JSON.stringify(testStos));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(
      PermitAppInfo.PermitDateFormat.toString(),
    );

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(0);
  });

  it('should fail validation for STOS with invalid configuration', async () => {
    const permit = JSON.parse(JSON.stringify(testStos));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(
      PermitAppInfo.PermitDateFormat.toString(),
    );
    // Add an invalid trailer to the configuration list
    permit.permitData.vehicleConfiguration.trailers.push({
      vehicleSubType: '_INVALID',
    });

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(1);
  });
});

describe('Policy Configuration Missing Elements', () => {
  const policy: Policy = new Policy(trosNoParamsSample);

  it('should not fail when a validation has no params', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(
      PermitAppInfo.PermitDateFormat.toString(),
    );

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(1);
    expect(validationResult.violations[0].message).not.toBeUndefined;
    expect(validationResult.violations[0].message).not.toBeNull;
  });
});

describe('Permit Engine Validation Results Aggregator', () => {
  const policy: Policy = new Policy(allEventTypes);

  it('should process all event types', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));

    const validationResult = await policy.validate(permit);
    // Violation 1: expected structure
    // Violation 2: unknown event type (defaults to violation)
    expect(validationResult.violations).toHaveLength(2);
    expect(validationResult.requirements).toHaveLength(1);
    expect(validationResult.warnings).toHaveLength(1);
    // Information 1: expected structure
    // Information 2: params object, but no message property
    // Information 3: no params object in the event
    expect(validationResult.information).toHaveLength(3);
  });
});
