import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { CaseActivityType } from '../enum/case-activity-type.enum';

@ValidatorConstraint({ name: 'SuspendComment', async: false })
export class CaseActivityCommentConstraint
  implements ValidatorConstraintInterface
{
  validate(comment: string | undefined, args: ValidationArguments) {
    const caseActivityType = (
      args.object as {
        caseActivityType?: CaseActivityType;
      }
    ).caseActivityType; // Access the searchString property from the same object

    // If CaseActivityType.REJECTED, comment should exists
    if (caseActivityType === CaseActivityType.REJECTED && !comment) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return `Comment is required when activity type is ${CaseActivityType.REJECTED} `;
  }
}
