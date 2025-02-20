import { Box, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { Controller } from "react-hook-form";

import "./ThirdPartyLiabilitySection.scss";
import { PERMIT_TYPES, PermitType } from "../../../../types/PermitType";
import { requiredMessage } from "../../../../../../common/helpers/validationMessages";
import { Nullable } from "../../../../../../common/types/common";
import { THIRD_PARTY_LIABILITIES, ThirdPartyLiability } from "../../../../types/ThirdPartyLiability";

export const ThirdPartyLiabilitySection = ({
  permitType,
  thirdPartyLiability,
  onChange,
}: {
  permitType: PermitType;
  thirdPartyLiability?: Nullable<ThirdPartyLiability>;
  onChange: (updatedThirdPartyLiability: ThirdPartyLiability) => void;
}) => {
  const showSection = ([
    PERMIT_TYPES.STFR,
    PERMIT_TYPES.QRFR,
  ] as PermitType[]).includes(permitType);

  return showSection ? (
    <div className="third-party-liability-section">
      <Box className="third-party-liability-section__header">
        <h3 className="third-party-liability-section__title">
          Third Party Liability
        </h3>
      </Box>

      <Box className="third-party-liability-section__body">
        <Controller
          name="permitData.thirdPartyLiability"
          rules={{
            required: { value: true, message: requiredMessage() },
          }}
          render={() => (
            <RadioGroup
              className="third-party-liability-section__radio-group"
              defaultValue={thirdPartyLiability}
              value={thirdPartyLiability}
              onChange={(e) => onChange(e.target.value as ThirdPartyLiability)}
            >
              <div
                className={`third-party-liability third-party-liability--general ${
                  thirdPartyLiability === THIRD_PARTY_LIABILITIES.GENERAL_GOODS
                    ? "third-party-liability--active"
                    : ""
                }`}
              >
                <FormControlLabel
                  className="third-party-liability__label"
                  label="General Goods"
                  value={THIRD_PARTY_LIABILITIES.GENERAL_GOODS}
                  control={
                    <Radio
                      key="general-goods"
                      className="third-party-liability__radio"
                      classes={{
                        checked: "third-party-liability__radio--checked"
                      }}
                    />}
                />
              </div>

              <div
                className={`third-party-liability third-party-liability--dangerous ${
                  thirdPartyLiability === THIRD_PARTY_LIABILITIES.DANGEROUS_GOODS
                    ? "third-party-liability--active"
                    : ""
                }`}
              >
                <FormControlLabel
                  className="third-party-liability__label"
                  label="Dangerous Goods"
                  value={THIRD_PARTY_LIABILITIES.DANGEROUS_GOODS}
                  control={
                    <Radio
                      key="dangerous-goods"
                      className="third-party-liability__radio"
                      classes={{
                        checked: "third-party-liability__radio--checked"
                      }}
                    />
                  }
                />
              </div>
            </RadioGroup>
          )}
        />
      </Box>
    </div>
  ) : null;
};
