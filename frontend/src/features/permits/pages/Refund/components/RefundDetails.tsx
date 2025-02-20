import { Box } from "@mui/material";
import "./RefundDetails.scss";

/**
 * Component that displays total refund due, current permit value and new permit value.
 */
export const RefundDetails = ({
  totalRefundDue,
  currentPermitValue,
  newPermitValue,
}: {
  totalRefundDue: number;
  currentPermitValue: number;
  newPermitValue: number;
}) => {
  const toSentenceCase = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatValue = (value: number | string): string => {
    if (typeof value === "number" || !isNaN(Number(value))) {
      return new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value));
    } else {
      return toSentenceCase(value);
    }
  };

  const renderValue = (value: number | string): string => {
    if (typeof value === "number" || !isNaN(Number(value))) {
      return `$${formatValue(value)}`;
    } else {
      return formatValue(value);
    }
  };

  return (
    <div className="refund-details">
      <Box className="refund-details__table">
        <Box className="refund-details__col">
          <dt className="refund-details__text">Total Refund Due</dt>
          <dd className="refund-details__text">
            {renderValue(Math.abs(totalRefundDue))}
          </dd>
        </Box>
        <Box className="refund-details__col">
          <dt className="refund-details__text">Current Permit Value</dt>
          <dd className="refund-details__text">
            {renderValue(currentPermitValue)}
          </dd>
        </Box>
        <Box className="refund-details__col">
          <dt className="refund-details__text">New Permit Value</dt>
          <dd className="refund-details__text">
            {renderValue(newPermitValue)}
          </dd>
        </Box>
      </Box>
    </div>
  );
};
