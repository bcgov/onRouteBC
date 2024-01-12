import { useContext, useEffect, useState } from "react";

import "./AmendPermitReview.scss";
import { AmendPermitContext } from "../context/AmendPermitContext";
import { useCompanyInfoDetailsQuery } from "../../../../manageProfile/apiManager/hooks";
import { PermitReview } from "../../TermOversize/components/review/PermitReview";
import { Breadcrumb } from "../../../../../common/components/breadcrumb/Breadcrumb";
import { getDefaultFormDataFromPermit } from "../types/AmendPermitFormData";
import { ReviewReason } from "./review/ReviewReason";
import { calculateAmountToRefund } from "../../../helpers/feeSummary";
import { isValidTransaction } from "../../../helpers/payment";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../../../common/helpers/util";

import {
  usePowerUnitSubTypesQuery,
  useTrailerSubTypesQuery,
} from "../../../../manageVehicles/apiManager/hooks";

export const AmendPermitReview = () => {
  const { permit, permitFormData, permitHistory, back, next, getLinks } =
    useContext(AmendPermitContext);

  const validTransactionHistory = permitHistory.filter((history) =>
    isValidTransaction(history.paymentMethodTypeCode, history.pgApproved),
  );

  const { data: companyInfo } = useCompanyInfoDetailsQuery(
    getDefaultRequiredVal(0, permitFormData?.companyId),
  );
  const powerUnitSubTypesQuery = usePowerUnitSubTypesQuery();
  const trailerSubTypesQuery = useTrailerSubTypesQuery();

  // For the confirmation checkboxes
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async () => {
    setIsSubmitted(true);
    if (!isChecked) return;
    next();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const oldFields = getDefaultFormDataFromPermit(permit);

  const amountToRefund =
    -1 *
    calculateAmountToRefund(
      validTransactionHistory,
      getDefaultRequiredVal(0, permitFormData?.permitData?.permitDuration),
    );

  return (
    <div className="amend-permit-review">
      <Breadcrumb links={getLinks()} />

      <PermitReview
        permitType={permitFormData?.permitType}
        permitNumber={permitFormData?.permitNumber}
        applicationNumber={permitFormData?.applicationNumber}
        isAmendAction={true}
        permitStartDate={permitFormData?.permitData?.startDate}
        permitDuration={permitFormData?.permitData?.permitDuration}
        permitExpiryDate={permitFormData?.permitData?.expiryDate}
        permitConditions={permitFormData?.permitData?.commodities}
        createdDateTime={permitFormData?.createdDateTime}
        updatedDateTime={permitFormData?.updatedDateTime}
        companyInfo={companyInfo}
        contactDetails={permitFormData?.permitData?.contactDetails}
        continueBtnText="Continue"
        onEdit={back}
        onContinue={onSubmit}
        allChecked={isChecked}
        setAllChecked={setIsChecked}
        hasAttemptedCheckboxes={isSubmitted}
        powerUnitSubTypes={powerUnitSubTypesQuery.data}
        trailerSubTypes={trailerSubTypesQuery.data}
        vehicleDetails={permitFormData?.permitData?.vehicleDetails}
        vehicleWasSaved={
          permitFormData?.permitData?.vehicleDetails?.saveVehicle
        }
        showChangedFields={true}
        oldFields={{
          ...oldFields,
          permitId: applyWhenNotNullable((id) => `${id}`, oldFields.permitId),
          previousRevision: applyWhenNotNullable(
            (prevRev) => `${prevRev}`,
            oldFields.previousRevision,
          ),
          permitData: {
            ...oldFields.permitData,
            companyName: getDefaultRequiredVal(
              "",
              oldFields.permitData.companyName,
            ),
            clientNumber: getDefaultRequiredVal(
              "",
              oldFields.permitData.clientNumber,
            ),
          },
        }}
        calculatedFee={`${amountToRefund}`}
      >
        {permitFormData?.comment ? (
          <ReviewReason reason={permitFormData.comment} />
        ) : null}
      </PermitReview>
    </div>
  );
};
