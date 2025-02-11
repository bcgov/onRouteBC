import "./FeeSummary.scss";
import { Nullable } from "../../../../common/types/common";
import { feeSummaryDisplayText } from "../../helpers/feeSummary";
import { getPermitTypeName, PermitType } from "../../types/PermitType";

export const FeeSummary = ({
  permitType,
  feeSummary,
  permitDuration,
  hideDescriptions,
  permittedRouteTotalDistance,
}: {
  permitType?: Nullable<PermitType>;
  feeSummary?: Nullable<string>;
  permitDuration?: number;
  hideDescriptions?: boolean;
  permittedRouteTotalDistance?: Nullable<number>;
}) => {
  const feeDisplayText = feeSummaryDisplayText(
    feeSummary,
    permitDuration,
    permitType,
    permittedRouteTotalDistance,
  );

  return (
    <div className="fee-summary">
      <div className="fee-summary__title">Fee Summary</div>
      <div className="fee-summary__table">
        {hideDescriptions ? null : (
          <>
            <div className="table-row table-row--header">
              <div className="table-row__th">Description</div>
              <div className="table-row__th">Amount</div>
            </div>

            <div className="table-row">
              <div
                className="table-row__td"
                data-testid="fee-summary-permit-type"
              >
                {getPermitTypeName(permitType)}
              </div>

              <div className="table-row__td" data-testid="fee-summary-price">
                {feeDisplayText}
              </div>
            </div>
          </>
        )}

        <div className="table-row table-row--total">
          <div className="table-row__tf">Total (CAD)</div>
          <div className="table-row__tf" data-testid="fee-summary-total">
            {feeDisplayText}
          </div>
        </div>
      </div>
    </div>
  );
};
