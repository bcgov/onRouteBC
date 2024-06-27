import { Operator } from 'json-rules-engine';
import { PermitAppInfo } from '../enum/permit-app-info.enum';
import dayjs from 'dayjs';

function stringValidator(a: any): boolean {
  return typeof a === 'string';
}

function dateStringValidator(a: any): boolean {
  const d = dayjs(a, PermitAppInfo.PermitDateFormat.toString());
  return d.isValid();
}

const CustomOperators: Array<Operator> = [];

CustomOperators.push(
  new Operator(
    'stringMinimumLength',
    (a: string, b: number) => a.trim().length >= b,
    stringValidator,
  ),
);

CustomOperators.push(
  new Operator(
    'dateLessThan',
    (a: string, b: string) => {
      const firstDate = dayjs(a, PermitAppInfo.PermitDateFormat.toString());
      const secondDate = dayjs(b, PermitAppInfo.PermitDateFormat.toString());
      return firstDate.diff(secondDate) < 0;
    },
    dateStringValidator,
  ),
);

CustomOperators.push(
  new Operator(
    'regex',
    (a: string, b: string) => a.match(b) !== null,
    stringValidator,
  ),
);

export default CustomOperators;
