import {
  UseQueryResult,
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";

import { VEHICLES_URL } from "../../../../common/apiManager/endpoints/endpoints";
import { ONE_HOUR } from "../../../../common/constants/constants";
import {
  httpGETRequest,
  httpGETRequestStream,
  httpPOSTRequestStream,
} from "../../../../common/apiManager/httpRequestHandler";

import {
  PaymentAndRefundDetailRequest,
  PaymentAndRefundSummaryRequest,
} from "../types/types";
import { streamDownloadFile } from "../../../../common/helpers/util";

/**
 * Streams a file through a POST request.
 *
 * @param url The API endpoint.
 * @param requestBody The request payload
 * @returns An object containing the filename and blob.
 * @throws Error when the file cannot be downloaded.
 */
const streamDownloadWithHTTPPost = async (
  url: string,
  requestBody: any,
): Promise<{
  blobObj: Blob;
  filename: string;
}> => {
  const response = await httpPOSTRequestStream(url, requestBody);
  const file = await streamDownloadFile(response);
  return file;
};

/**
 * Retrieves the payment and refund summary report.
 * @param requestObject The {@link PaymentAndRefundSummaryRequest} object
 * @returns A Promise containing the AxiosResponse
 */
export const getPaymentAndRefundSummary = async (
  requestObject: PaymentAndRefundSummaryRequest,
) => {
  const url = `${VEHICLES_URL}/payment/report/summary`;
  return await streamDownloadWithHTTPPost(url, requestObject);
};

/**
 * Retrieves the payment and refund summary report.
 * @param requestObject The {@link PaymentAndRefundSummaryRequest} object
 * @returns A Promise containing the AxiosResponse
 */
export const getPaymentAndRefundSummaryMock = async (
) => {
  const url = `${VEHICLES_URL}/permits/reports`;
  return await httpGETRequestStream(url.toString());
};

/**
 * Retrieves the payment and refund detail report.
 * @param requestObject The {@link PaymentAndRefundDetailRequest} object
 * @returns A Promise containing the AxiosResponse
 */
export const getPaymentAndRefundDetail = async (
  requestObject: PaymentAndRefundDetailRequest,
) => {
  const url = `${VEHICLES_URL}/payment/report/detailed`;
  return await streamDownloadWithHTTPPost(url, requestObject);
};

/**
 * Retrieves the permit types to be used in the reports page.
 * @returns A Promise containing the permit types in key - value pairs
 * where the key is the permitTypeCode and the value is the display.
 */
export const getPermitTypes = async (): Promise<Record<string, string>> => {
  const url = `${VEHICLES_URL}/permits/permit-types`;
  return httpGETRequest(url.toString()).then((response) => response.data);
};

/**
 * Hook to fetch the permit types.
 * @returns A query result object containing the permit types
 */
export const usePermitTypesQuery = (): UseQueryResult<
  Record<string, string>,
  unknown
> => {
  return useQuery({
    queryKey: ["permitTypes"],
    queryFn: () => getPermitTypes(),
    placeholderData: keepPreviousData,
    staleTime: ONE_HOUR,
  });
};
