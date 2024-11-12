import { Policy } from 'onroute-policy-engine';
import { PermitAppInfo } from 'onroute-policy-engine/enum';
import { masterPolicyConfig } from '../_test/policy-config/master.sample';
import { validTros30Day } from '../_test/permit-app/valid-tros-30day';
import dayjs from 'dayjs';

async function start() {
  const policy: Policy = new Policy(masterPolicyConfig);

  // Set startDate to today
  validTros30Day.permitData.startDate = dayjs().format(
    PermitAppInfo.PermitDateFormat.toString(),
  );

  // Set duration to 31 days (an invalid duration)
  validTros30Day.permitData.permitDuration = 31;

  const validationResult2 = await policy.validate(validTros30Day);
  console.log(JSON.stringify(validationResult2, null, '   '));
}

start();
