import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Nullable } from '../types/common';
import { ApplicationSearch } from '../enum/application-search.enum';
import { ApplicationQueueStatus } from '../enum/case-status-type.enum';

@ValidatorConstraint({ name: 'ApplicationSearch', async: false })
export class ApplicationSearchConstraint
  implements ValidatorConstraintInterface
{
  validate(
    value: ApplicationSearch | boolean | undefined | ApplicationQueueStatus[],
    args: ValidationArguments,
  ) {
    const fields = args.object as {
      pendingPermits?: Nullable<boolean>;
      applicationQueueStatus?: Nullable<ApplicationQueueStatus[]>;
      searchColumn?: Nullable<ApplicationSearch>;
      searchString?: Nullable<string>;
    };
    if (
      fields.pendingPermits != undefined &&
      fields.applicationQueueStatus?.length
    ) {
      return false;
    } else if (fields.searchColumn && !fields.searchString) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const message: string[] = [];
    const fields = args.object as {
      pendingPermits?: Nullable<boolean>;
      applicationQueueStatus?: Nullable<ApplicationQueueStatus[]>;
      searchColumn?: Nullable<ApplicationSearch>;
      searchString?: Nullable<string>;
    };
    if (
      fields.pendingPermits != undefined &&
      fields.applicationQueueStatus?.length
    ) {
      message.push(
        'Both pendingPermits and applicationQueueStatus cannot be set at the same time.',
      );
    }
    if (fields.searchColumn && !fields.searchString) {
      message.push('searchString is required when searchColumn is defined.');
    }
    if (message?.length) {
      return message.join(', ');
    }
  }
}
