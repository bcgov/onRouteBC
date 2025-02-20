/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useState } from "react";
import {
  Box,
  Divider,
  FormControlLabel,
  Paper,
  Radio,
  Stack,
} from "@mui/material";

import "./dashboard.scss";
import { Banner } from "../../../../common/components/dashboard/components/banner/Banner";
import { BC_COLOURS } from "../../../../themes/bcGovStyles";
import { PaymentAndRefundDetail } from "../../reporting/forms/PaymentAndRefundDetail";
import { PaymentAndRefundSummary } from "../../reporting/forms/PaymentAndRefundSummary";
import { CSVPaymentAndRefundSummary } from "../../reporting/forms/CSVPaymentAndRefundSummary";

/**
 * The types of reports.
 */
enum REPORT_TYPES {
  SUMMARY,
  DETAIL,
}

/**
 * A reusable component for displaying the report options.
 * Not intended to be exported as it is custom made for the reports.
 * @returns A React component
 */
const ReportOption = ({
  label,
  isSelected,
  onSelect,
}: {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <Paper
      elevation={isSelected ? 5 : 0}
      className="report-paper"
      sx={{
        ":hover": {
          background: isSelected ? null : BC_COLOURS.bc_background_light_grey,
        },
        background: isSelected ? BC_COLOURS.bc_messages_blue_background : null,
      }}
      onClick={onSelect}
    >
      <FormControlLabel
        control={<Radio checked={isSelected} />}
        label={<strong>{label}</strong>}
      />
    </Paper>
  );
};

/**
 * React component to render the reports page by an IDIR user.
 */
export const IDIRReportsDashboard = memo(() => {
  const [reportMode, setReportMode] = useState<REPORT_TYPES>(
    REPORT_TYPES.SUMMARY,
  );

  return (
    <>
      <Box
        className="layout-box"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Banner bannerText="Reports" />
      </Box>
      <div
        className="idir-reports-dashboard"
        role="tabpanel"
        id={`idir-reports-dashboard`}
        aria-labelledby={`idir-reports-dashboard`}
      >
        <Stack
          direction="row"
          spacing={5}
          style={{
            paddingTop: "40px",
          }}
          divider={
            <Divider
              flexItem
              orientation="vertical"
              color={BC_COLOURS.bc_border_grey}
              sx={{ height: "961px" }}
            />
          }
        >
          <Stack className="report-form-area" spacing={3}>
            <ReportOption
              label="Payment and Refund Summary"
              isSelected={reportMode === REPORT_TYPES.SUMMARY}
              key="summary-report-radio"
              onSelect={() => {
                setReportMode(() => REPORT_TYPES.SUMMARY);
              }}
            />
            <ReportOption
              label="Payment and Refund Detail"
              isSelected={reportMode === REPORT_TYPES.DETAIL}
              key="detail-report-radio"
              onSelect={() => {
                setReportMode(() => REPORT_TYPES.DETAIL);
              }}
            />
          </Stack>
          {/* {reportMode === REPORT_TYPES.SUMMARY && <PaymentAndRefundSummary />} */}
          {reportMode === REPORT_TYPES.SUMMARY && <CSVPaymentAndRefundSummary />}
          {reportMode === REPORT_TYPES.DETAIL && <PaymentAndRefundDetail />}
        </Stack>
      </div>
    </>
  );
});

IDIRReportsDashboard.displayName = "IDIRReportsDashboard";
