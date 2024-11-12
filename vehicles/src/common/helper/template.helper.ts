import { InternalServerErrorException } from '@nestjs/common';
import { ApplicationStatus } from '../enum/application-status.enum';
import { PermitType } from '../enum/permit-type.enum';
import {
  PermitTemplateMapping,
  TemplateName,
} from '../enum/template-name.enum';

/**
 * Returns the appropriate template name based on the provided application status and permit type.
 * Throws an error if the combination of status and type does not yield a valid template.
 *
 * @param {ApplicationStatus} status - The status of the application for which the template is required.
 * @param {PermitType} type - The type of permit for which the template is required.
 * @returns {TemplateName} - The template name corresponding to the status and type provided.
 * @throws {InternalServerErrorException} - If no valid template is found for the given status.
 */
export const getPermitTemplateName = (
  status: ApplicationStatus,
  type: PermitType,
): TemplateName => {
  const templateMapping: PermitTemplateMapping = {
    [ApplicationStatus.ISSUED]: {
      [PermitType.SINGLE_TRIP_OVERSIZE]: TemplateName.PERMIT_STOS,
      [PermitType.MOTIVE_FUEL_USER]: TemplateName.PERMIT_MFP,
      default: TemplateName.PERMIT,
    },
    [ApplicationStatus.VOIDED]: {
      [PermitType.SINGLE_TRIP_OVERSIZE]: TemplateName.PERMIT_STOS_VOID,
      [PermitType.MOTIVE_FUEL_USER]: TemplateName.PERMIT_MFP_VOID,
      default: TemplateName.PERMIT_VOID,
    },
    [ApplicationStatus.REVOKED]: {
      [PermitType.SINGLE_TRIP_OVERSIZE]: TemplateName.PERMIT_STOS_REVOKED,
      [PermitType.MOTIVE_FUEL_USER]: TemplateName.PERMIT_MFP_REVOKED,
      default: TemplateName.PERMIT_REVOKED,
    },
  };

  const template =
    templateMapping[status]?.[type] || templateMapping[status]?.default;
  if (!template) {
    throw new InternalServerErrorException(
      'Invalid status for document generation',
    );
  }
  return template;
};
