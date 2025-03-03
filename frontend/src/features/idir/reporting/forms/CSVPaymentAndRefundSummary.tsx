/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Divider, FormGroup, Stack } from "@mui/material";
import dayjs from "dayjs";
import { FormProvider, useForm } from "react-hook-form";
import { useContext, useEffect, useMemo, useState } from "react";

import { BC_COLOURS } from "../../../../themes/bcGovStyles";
import { openBlobInNewTab } from "../../../permits/helpers/permitPDFHelper";
import {
  getPaymentAndRefundSummary,
  getPaymentAndRefundSummaryMock,
} from "../api/reports";
import { IssuedByCheckBox } from "./subcomponents/IssuedByCheckBox";
import { ReportDateTimePickers } from "./subcomponents/ReportDateTimePickers";
import { SnackBarContext } from "../../../../App";
import { Loading } from "../../../../common/pages/Loading";
import {
  PaymentAndRefundSummaryFormData,
  PaymentAndRefundSummaryRequest,
  REPORT_ISSUED_BY,
} from "../types/types";
import Papa from "papaparse";
import { getAccessToken } from "../../../../common/apiManager/httpRequestHandler";
import { VEHICLES_URL } from "../../../../common/apiManager/endpoints/endpoints";

/**
 * Component for Payment and Refund Summary form
 */
export const CSVPaymentAndRefundSummary = () => {
  const { setSnackBar } = useContext(SnackBarContext);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const formMethods = useForm<PaymentAndRefundSummaryFormData>({
    defaultValues: {
      issuedBy: ["SELF_ISSUED", "PPC"],
      fromDateTime: dayjs()
        .subtract(1, "day")
        .set("h", 21)
        .set("m", 0)
        .set("s", 0)
        .set("ms", 0),
      toDateTime: dayjs().set("h", 20).set("m", 59).set("s", 59).set("ms", 999),
    },
    reValidateMode: "onBlur",
  });

  const { watch, handleSubmit } = formMethods;

  const issuedBy = watch("issuedBy");
  const fromDateTime = watch("fromDateTime");
  const toDateTime = watch("toDateTime");
  const worker: Worker = useMemo(
    () =>
      new Worker(new URL("./subcomponents/worker/worker.ts", import.meta.url), {
        type: "module",
      }),
    [],
  );
  console.log("worker::", worker);

  useEffect(() => {
    if (window.Worker) {
      worker.onmessage = (e: MessageEvent<{ csvURL: string }>) => {
        setIsGeneratingReport(() => false);
        console.log("Worker finished");
        const tempLink = document.createElement("a");
        tempLink.style.display = "none";
        tempLink.href = e.data.csvURL;
        tempLink.setAttribute("download", "payment-summary.csv");
        tempLink.click();
      };
    }
  }, [worker]);

  /**
   * Opens the report in a new tab.
   */
  const onClickViewReport = async () => {
    setIsGeneratingReport(() => true);
    try {
      worker.postMessage({
        command: "get-csv",
        accessToken: getAccessToken(),
        vehiclesURL: VEHICLES_URL,
      });
      // const response = await getPaymentAndRefundSummaryMock();
      // console.log("response::", response);
      // if (response.status === 200 && response.body !== null) {
      //   const reader = response.body.getReader();
      //   const stream = new ReadableStream({
      //     start: (controller) => {
      //       const processRead = async () => {
      //         const { done, value } = await reader.read();
      //         if (done) {
      //           // When no more data needs to be consumed, close the stream
      //           controller.close();
      //           return;
      //         }
      //         // Enqueue the next data chunk into our target stream
      //         controller.enqueue(value);
      //         await processRead();
      //       };
      //       processRead();
      //     },
      //   });
      //   const newRes = new Response(stream);
      //   const blobObj = await newRes.arrayBuffer();
      //   console.log("blobObj::", blobObj);
      //   const jsonstring = new TextDecoder().decode(blobObj as ArrayBuffer);
      //   console.log("jsonstring::", JSON.parse(jsonstring));
      //   // const { data } = response;
      //   // console.log("data::", data);
      //   // const csvString = Papa.unparse(data, {
      //   //   header: true,
      //   //   quotes: false,
      //   // });
      //   // const csvData = new Blob([csvString], {
      //   //   type: "text/csv;charset=utf-8;",
      //   // });
      //   // const csvURL = URL.createObjectURL(csvData);
      //   // const tempLink = document.createElement("a");
      //   // tempLink.style.display = "none";
      //   // tempLink.href = csvURL;
      //   // tempLink.setAttribute("download", "payment-summary.csv");
      //   // tempLink.click();
      // }
    } catch (err) {
      console.error(err);
      setSnackBar({
        message: "An unexpected error occurred.",
        showSnackbar: true,
        setShowSnackbar: () => true,
        alertType: "error",
      });
    } finally {
      // setIsGeneratingReport(() => false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <Stack style={{ width: "900px" }} spacing={2}>
        <h2>Payment and Refund Summary</h2>
        <Divider
          flexItem
          orientation="horizontal"
          color={BC_COLOURS.bc_border_grey}
        />
        {isGeneratingReport && <Loading />}
        {!isGeneratingReport && (
          <FormGroup>
            <span>
              <strong>Issued By</strong>
            </span>
            <Stack direction="row" spacing={5}>
              <IssuedByCheckBox
                issuedByOption={REPORT_ISSUED_BY.SELF_ISSUED}
                label="Self Issued"
              />
              <IssuedByCheckBox
                issuedByOption={REPORT_ISSUED_BY.PPC}
                label="PPC"
              />
            </Stack>
            <br />
            <Stack direction="row" spacing={3}>
              <ReportDateTimePickers />
            </Stack>
            <br />
            <Stack direction="row">
              <Button
                disabled={issuedBy.length === 0}
                key="view-report-button"
                aria-label="View Report"
                variant="contained"
                color="primary"
                onClick={handleSubmit(onClickViewReport)}
              >
                View Report
              </Button>
            </Stack>
          </FormGroup>
        )}
      </Stack>
    </FormProvider>
  );
};
