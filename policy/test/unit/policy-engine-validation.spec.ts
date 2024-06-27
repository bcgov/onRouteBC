import Policy from '../../src/policy-engine';
import { trosOnly } from '../policy-config/tros-only.sample';
import { trosNoAllowedVehicles } from '../policy-config/tros-no-allowed-vehicles.sample';
import { masterPolicyConfig } from '../policy-config/master.sample';
import { validTros30Day } from '../permit-app/valid-tros-30day';
import { validTrow120Day } from '../permit-app/valid-trow-120day';
import { allEventTypes } from '../policy-config/all-event-types.sample';
import { transformPermitFacts } from '../../src/helper/facts.helper';
import dayjs from 'dayjs';
import PermitApplication from '../../src/type/permit-application.type';
import { PermitAppInfo } from '../../src/enum/permit-app-info.enum';

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
    permit.permitData.startDate = dayjs().format(PermitAppInfo.PermitDateFormat.toString());

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
    permit.permitData.startDate = dayjs().format(PermitAppInfo.PermitDateFormat.toString());
    permit.permitType = '__INVALID';

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(1);
  });

  it('should raise violation for invalid vehicle type', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(PermitAppInfo.PermitDateFormat.toString());
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
});

describe('Master Policy Configuration Validator', () => {
  const policy: Policy = new Policy(masterPolicyConfig);

  it('should validate TROS successfully', async () => {
    const permit = JSON.parse(JSON.stringify(validTros30Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(PermitAppInfo.PermitDateFormat.toString());

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(0);
  });

  it('should validate TROW successfully', async () => {
    const permit = JSON.parse(JSON.stringify(validTrow120Day));
    // Set startDate to today
    permit.permitData.startDate = dayjs().format(PermitAppInfo.PermitDateFormat.toString());

    const validationResult = await policy.validate(permit);
    expect(validationResult.violations).toHaveLength(0);
  });
});

describe('Permit Application Transformer', () => {
  it('should return empty facts for null application', () => {
    let nullApp: PermitApplication = JSON.parse('null');
    const permitFacts = transformPermitFacts(nullApp);
    expect(permitFacts.companyName).toBeFalsy();
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
