import { useContext, useEffect, useRef } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { Loading } from "../../../../common/pages/Loading";
import { useCompleteTransaction, useIssuePermits } from "../../hooks/hooks";
import { applyWhenNotNullable, getDefaultRequiredVal } from "../../../../common/helpers/util";
import { DATE_FORMATS, toUtc } from "../../../../common/helpers/formatDate";
import { hasPermitsActionFailed } from "../../helpers/permitState";
import { PaymentCardTypeCode } from "../../../../common/types/paymentMethods";
import { useAddToCart } from "../../hooks/cart";
import OnRouteBCContext from "../../../../common/authentication/OnRouteBCContext";
import { getCompanyIdFromSession } from "../../../../common/apiManager/httpRequestHandler";
import {
  getPayBCPaymentDetails,
  usePaymentByTransactionIdQuery,
} from "../../helpers/payment";

import {
  ERROR_ROUTES,
  PERMITS_ROUTES,
  SHOPPING_CART_ROUTES,
} from "../../../../routes/constants";

import {
  CompleteTransactionRequestData,
  PayBCPaymentDetails,
} from "../../types/payment";

/**
 * React component that handles the payment redirect and displays the payment status.
 * If the payment status is "Approved", it renders the SuccessPage component.
 * Otherwise, it displays the payment status message.
 */
export const PaymentRedirect = () => {
  const navigate = useNavigate();
  const completedTransaction = useRef(false);
  const { companyId: companyIdFromContext } = useContext(OnRouteBCContext);
  const companyId: number = getDefaultRequiredVal(
    0,
    companyIdFromContext,
    applyWhenNotNullable(id => Number(id), getCompanyIdFromSession()),
  );

  const issuedPermit = useRef(false);
  const [searchParams] = useSearchParams();
  const paymentDetails = getPayBCPaymentDetails(searchParams);
  const transaction = mapTransactionDetails(paymentDetails);
  const transactionId = getDefaultRequiredVal("", searchParams.get("ref2"));
  const transactionQueryString = encodeURIComponent(searchParams.toString());
  const transactionIdQuery = usePaymentByTransactionIdQuery(transactionId);
  const addToCartMutation = useAddToCart();

  const { mutation: completeTransactionMutation, paymentApproved } =
    useCompleteTransaction(
      paymentDetails.messageText,
      paymentDetails.trnApproved,
    );

  const { mutation: issuePermitsMutation, issueResults } = useIssuePermits();
  const issueFailed = hasPermitsActionFailed(issueResults);

  useEffect(() => {
    if (completedTransaction.current === false) {
      completeTransactionMutation.mutate({
        transactionId: getDefaultRequiredVal("", transactionId),
        transactionQueryString,
        transactionDetails: transaction,
      });
      completedTransaction.current = true;
    }
  }, [paymentDetails.trnApproved]);

  useEffect(() => {
    const applicationIds: string[] = [];
    if (transactionIdQuery?.isSuccess && issuedPermit?.current === false) {
      transactionIdQuery?.data?.applicationDetails?.forEach((application) => {
        if (application?.applicationId) {
          applicationIds.push(application.applicationId);
        }
      });

      if (paymentApproved === true) {
        // Payment successful, proceed to issue permit
        issuePermitsMutation.mutate({
          companyId,
          applicationIds,
        });
        issuedPermit.current = true;
      } else if (paymentApproved === false) {
        // Add back to cart and then redirect to shopping cart.
        if (!addToCartMutation.isPending && addToCartMutation.isIdle && companyId) {
          addToCartMutation
            .mutateAsync({
              companyId,
              applicationIds,
            })
            .then(({ failure }) => {
              // Cannot add applications back to cart
              if (failure.length > 0) {
                navigate(ERROR_ROUTES.UNEXPECTED);
              } else {
                // Payment failed, redirect back to pay now page
                navigate(SHOPPING_CART_ROUTES.DETAILS(true), {
                  replace: true,
                });
              }
            })
            .catch(() => {
              navigate(ERROR_ROUTES.UNEXPECTED);
            });
        }
      }
    }

    if (transactionIdQuery?.isError)
      navigate(ERROR_ROUTES.UNEXPECTED, { replace: true });
  }, [paymentApproved, transactionIdQuery, companyId]);

  if (issueFailed) {
    return <Navigate to={`${ERROR_ROUTES.ISSUANCE}`} replace={true} />;
  }

  // At this point, the permits are either being issued or all of them have been issued successfully
  const successIds = getDefaultRequiredVal([], issueResults?.success);
  const hasValidIssueResults = successIds.length > 0;

  if (hasValidIssueResults) {
    return <Navigate to={`${PERMITS_ROUTES.SUCCESS}`} replace={true} />;
  }

  return <Loading />;
};

const mapTransactionDetails = (
  paymentResponse: PayBCPaymentDetails,
): CompleteTransactionRequestData => {
  const isValidCardType = paymentResponse.cardType !== "";

  const transactionDetails = {
    pgTransactionId: paymentResponse.trnId,
    pgApproved: Number(paymentResponse.trnApproved),
    pgAuthCode: paymentResponse.authCode,
    pgTransactionDate: toUtc(paymentResponse.trnDate, DATE_FORMATS.ISO8601),
    pgCvdId: paymentResponse.cvdId,
    pgPaymentMethod: paymentResponse.paymentMethod,
    pgMessageId: paymentResponse.messageId,
    pgMessageText: paymentResponse.messageText,
  };

  if (!isValidCardType) return transactionDetails;

  return {
    ...transactionDetails,
    pgCardType: paymentResponse.cardType as PaymentCardTypeCode,
  };
};
