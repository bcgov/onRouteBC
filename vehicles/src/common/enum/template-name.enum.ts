import { ApplicationStatus } from './application-status.enum';
import { PermitType } from './permit-type.enum';

export enum TemplateName {
  PERMIT = 'PERMIT',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
  PERMIT_VOID = 'PERMIT_VOID',
  PERMIT_REVOKED = 'PERMIT_REVOKED',
  PERMIT_STOS = 'PERMIT_STOS',
  PERMIT_STOS_VOID = 'PERMIT_STOS_VOID',
  PERMIT_STOS_REVOKED = 'PERMIT_STOS_REVOKED',
  PERMIT_MFP = 'PERMIT_MFP',
  PERMIT_MFP_VOID = 'PERMIT_MFP_VOID',
  PERMIT_MFP_REVOKED = 'PERMIT_MFP_REVOKED',
}

export type PermitTemplateMapping = {
  [K in ApplicationStatus]?: {
    [T in PermitType | 'default']?: TemplateName;
  };
};
