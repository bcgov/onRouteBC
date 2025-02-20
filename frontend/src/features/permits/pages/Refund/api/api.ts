import { httpPOSTRequest } from "../../../../../common/apiManager/httpRequestHandler";
import { replaceEmptyValuesWithNull } from "../../../../../common/helpers/util";
import { RequiredOrNull } from "../../../../../common/types/common";
import { PAYMENT_API_ROUTES } from "../../../apiManager/endpoints/endpoints";
import { StartTransactionResponseData } from "../../../types/payment";
import { RefundPermitData } from "../types/RefundPermitData";

export const refundPermit = async (
  requestData: RefundPermitData,
): Promise<RequiredOrNull<StartTransactionResponseData>> => {
  try {
    const response = await httpPOSTRequest(
      PAYMENT_API_ROUTES.REFUND,
      replaceEmptyValuesWithNull(requestData),
    );
    if (response.status !== 201) {
      return null;
    }
    return response.data as StartTransactionResponseData;
  } catch (error) {
    console.error(error);
    return null;
  }
};
