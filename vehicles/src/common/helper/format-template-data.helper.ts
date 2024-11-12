import * as constants from '../constants/api.constant';
import { convertUtcToPt, dateFormat } from '../helper/date-time.helper';
import { ApplicationStatus } from '../enum/application-status.enum';
import { PermitIssuedBy } from '../enum/permit-issued-by.enum';
import { Company } from '../../modules/company-user-management/company/entities/company.entity';
import { Permit } from '../../modules/permit-application-payment/permit/entities/permit.entity';
import {
  PermitData,
  PermitTemplateData,
} from '../interface/permit.template.interface';
import { FullNamesForDgen } from '../interface/full-names-for-dgen.interface';
import { formatAmount } from './payment.helper';

/**
 * Formats the permit data so that it can be used in the templated word documents
 * @param permit
 * @param fullNames
 * @param companyInfo used to get the company name and client number
 * @returns formatted permit data to be displayed on the PDF
 */
export const formatTemplateData = (
  permit: Permit,
  fullNames: FullNamesForDgen,
  companyInfo: Company,
  revisionHistory?: Permit[],
) => {
  // Create a new template object that includes the formatted values used in the templated word documents
  const template: PermitTemplateData = {
    permitName: '',
    permitNumber: '',
    permitType: '',
    createdDateTime: '',
    updatedDateTime: '',
    companyName: '',
    companyAlternateName: '',
    clientNumber: '',
    issuedBy: '',
    revisions: [],
    permitData: null,
    loas: '',
  };

  template.permitData = JSON.parse(permit.permitData.permitData) as PermitData;

  // Format Permit information
  template.permitName = fullNames.permitName;
  template.permitNumber = permit.permitNumber || '';
  template.permitType = permit.permitType;
  template.issuedBy =
    permit.permitIssuedBy === PermitIssuedBy.SELF_ISSUED
      ? constants.SELF_ISSUED
      : constants.PPC_FULL_TEXT;
  template.createdDateTime = convertUtcToPt(
    permit.createdDateTime,
    'MMM. D, YYYY, hh:mm a Z',
  );
  template.updatedDateTime = convertUtcToPt(
    permit.updatedDateTime,
    'MMM. D, YYYY, hh:mm a Z',
  );

  // Start & Expiry date
  template.permitData.startDate = dateFormat(
    template.permitData.startDate,
    'MMM. D, YYYY',
  );
  template.permitData.expiryDate = dateFormat(
    template.permitData.expiryDate,
    'MMM. D, YYYY',
  );

  // Format Vehicle Details
  template.permitData.vehicleDetails.vehicleType = fullNames.vehicleTypeName;
  template.permitData.vehicleDetails.vehicleSubType =
    fullNames.vehicleSubTypeName;
  template.permitData.vehicleDetails.countryCode = fullNames.mailingCountryName;
  template.permitData.vehicleDetails.provinceCode =
    fullNames.mailingProvinceName;

  // Format Mailing Address
  template.permitData.mailingAddress.countryCode = fullNames.vehicleCountryName;
  template.permitData.mailingAddress.provinceCode =
    fullNames.vehicleProvinceName;

  // Format Company
  template.companyName = companyInfo.legalName;
  template.clientNumber = companyInfo.clientNumber;
  template.companyAlternateName = companyInfo.alternateName;

  // Format Fee Summary
  const transcation = permit.permitTransactions?.at(0)?.transaction;

  template.permitData.feeSummary = formatAmount(
    transcation.transactionTypeId,
    permit.permitTransactions?.at(0)?.transactionAmount,
  ).toString();

  revisionHistory?.forEach((revision) => {
    if (
      revision.permitStatus == ApplicationStatus.ISSUED ||
      revision.permitStatus == ApplicationStatus.VOIDED ||
      revision.permitStatus == ApplicationStatus.REVOKED ||
      revision.permitId === permit.permitId
    ) {
      template.revisions.push({
        timeStamp: convertUtcToPt(
          revision.permitId === permit.permitId
            ? permit.permitIssueDateTime
            : revision.permitIssueDateTime,
          'MMM. D, YYYY, hh:mm a Z',
        ),
        description: revision.comment,
      });
    }
  });

  template.loas = template?.permitData?.loas
    ?.filter((item) => item.checked)
    ?.map((item) => item?.loaId)
    .join(', ');

  return template;
};
