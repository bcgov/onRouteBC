/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-globals */
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";

const httpGETRequestStream = (url: string, accessToken: string) => {
  return fetch(url, {
    headers: {
      Authorization: accessToken,
      "x-correlation-id": uuidv4(),
    },
  });
};
/**
 * Retrieves the payment and refund summary report.
 * @param requestObject The {@link PaymentAndRefundSummaryRequest} object
 * @returns A Promise containing the AxiosResponse
 */
const getPaymentAndRefundSummaryMock = async (
  vehiclesURL: string,
  accessToken: string,
) => {
  const url = `${vehiclesURL}/permits/reports`;
  return await httpGETRequestStream(url.toString(), accessToken);
};

self.onmessage = async function (
  e: MessageEvent<{
    command: string;
    accessToken: string;
    vehiclesURL: string;
  }>,
) {
  console.log("Message: ", e.data);
  if (e.data.command === "get-csv") {
    const response = await getPaymentAndRefundSummaryMock(
      e.data.vehiclesURL,
      e.data.accessToken,
    );
    console.log("response::", response);
    if (response.status === 200 && response.body !== null) {
      const reader = response.body.getReader();
      const stream = new ReadableStream({
        start: (controller) => {
          const processRead = async () => {
            const { done, value } = await reader.read();
            if (done) {
              // When no more data needs to be consumed, close the stream
              controller.close();
              return;
            }
            // Enqueue the next data chunk into our target stream
            controller.enqueue(value);
            await processRead();
          };
          processRead();
        },
      });
      const newRes = new Response(stream);
      const blobObj = await newRes.arrayBuffer();
      console.log("blobObj::", blobObj);
      const jsonstring = new TextDecoder().decode(blobObj as ArrayBuffer);
      const jsonObj = JSON.parse(jsonstring);
      console.log("jsonstring::", JSON.parse(jsonstring));
      // const { data } = response;
      // console.log("data::", data);
      const csvString = Papa.unparse(jsonObj, {
        header: true,
        quotes: false,
      });
      const csvData = new Blob([csvString], {
        type: "text/csv;charset=utf-8;",
      });
      const csvURL = URL.createObjectURL(csvData);
      self.postMessage({ csvURL });
    }
  }
  //   self.postMessage({ name: "download-link", link: url });
};

// const onClickViewReport = async () => {
//   try {
//     const response = await getPaymentAndRefundSummaryMock();
//     console.log("response::", response);
//     if (response.status === 200 && response.body !== null) {
//       const reader = response.body.getReader();
//       const stream = new ReadableStream({
//         start: (controller) => {
//           const processRead = async () => {
//             const { done, value } = await reader.read();
//             if (done) {
//               // When no more data needs to be consumed, close the stream
//               controller.close();
//               return;
//             }
//             // Enqueue the next data chunk into our target stream
//             controller.enqueue(value);
//             await processRead();
//           };
//           processRead();
//         },
//       });
//       const newRes = new Response(stream);
//       const blobObj = await newRes.arrayBuffer();
//       console.log("blobObj::", blobObj);
//       const jsonstring = new TextDecoder().decode(blobObj as ArrayBuffer);
//       const jsonObj = JSON.parse(jsonstring);
//       console.log("jsonstring::", JSON.parse(jsonstring));
//       // const { data } = response;
//       // console.log("data::", data);
//       const csvString = Papa.unparse(jsonObj, {
//         header: true,
//         quotes: false,
//       });
//       const csvData = new Blob([csvString], {
//         type: "text/csv;charset=utf-8;",
//       });
//       const csvURL = URL.createObjectURL(csvData);
//       return { csvURL };
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

export {};
