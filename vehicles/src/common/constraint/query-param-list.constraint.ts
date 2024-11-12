import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Nullable } from '../types/common';

@ValidatorConstraint({ name: 'QueryParamList', async: false })
export class QueryParamListConstraint implements ValidatorConstraintInterface {
  validate(field: Nullable<string>, args: ValidationArguments): boolean {
    return !this.validateQueryParamList(field, args)?.length;
  }

  validateQueryParamList(
    field: Nullable<string>,
    args: ValidationArguments,
  ): string[] {
    const fieldList = field?.split(',') || [];
    const allowedFieldValues = Object.values(
      args.constraints?.at(0) as Record<string, unknown>,
    );

    return fieldList.flatMap((fieldValue) => {
      const errors: string[] = [];
      if (!allowedFieldValues.includes(fieldValue)) {
        errors.push(
          `${fieldValue} is an invalid value. Possible values are: ${Object.values(allowedFieldValues).join(', ')}.`,
        );
      }
      return errors;
    });
  }

  defaultMessage(args: ValidationArguments): string {
    const applicationQueueStatus = (
      args.object as { applicationQueueStatus?: Nullable<string> }
    ).applicationQueueStatus;
    const invalidFields = this.validateQueryParamList(
      applicationQueueStatus,
      args,
    );
    return invalidFields.join(' ');
  }
}
