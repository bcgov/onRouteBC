import { Box, Checkbox, Typography } from "@mui/material";
import { useState } from "react";

import "./ConfirmationCheckboxes.scss";
import { CustomInputHTMLAttributes } from "../../../../../../common/types/formElements";

export const ConfirmationCheckboxes = ({
  hasAttemptedSubmission,
  areAllChecked,
  setAreAllChecked,
  shouldDisableCheckboxes,
}: {
  hasAttemptedSubmission: boolean;
  areAllChecked: boolean;
  setAreAllChecked: (allChecked: boolean) => void;
  shouldDisableCheckboxes: boolean;
}) => {
  const checkboxes = [
    {
      description:
        "Confirm that this permit is issued to the registered owner (or lessee) of the vehicle being permitted.",
      checked: shouldDisableCheckboxes,
    },
    {
      description:
        "Confirm compliance with the appropriate policy for the selected vehicle(s) and/or commodity(s).",
      checked: shouldDisableCheckboxes,
    },
    {
      description: "Confirm the information in this application is correct.",
      checked: shouldDisableCheckboxes,
    },
  ];

  const [confirmationCheckboxes, setConfirmationCheckboxes] =
    useState(checkboxes);

  const handleCheck = (checkedName: string) => {
    if (shouldDisableCheckboxes) return;

    const updatedCheckboxes = confirmationCheckboxes.map((item) => {
      if (shouldDisableCheckboxes) return item;

      if (item.description === checkedName) {
        return {
          description: item.description,
          checked: !item.checked,
        };
      }

      return item;
    });
    setConfirmationCheckboxes(updatedCheckboxes);
    setAreAllChecked(!updatedCheckboxes.some((updated) => !updated.checked));
  };

  return (
    <Box className="confirmation-checkboxes">
      <Typography className="confirmation-checkboxes__header" variant="h3">
        Please read the following carefully and check all to proceed.
      </Typography>

      {confirmationCheckboxes.map(({ description, checked }) => (
        <Box key={description} className="confirmation-checkboxes__attestation">
          <Checkbox
            className={
              "confirmation-checkboxes__checkbox " +
              `${
                hasAttemptedSubmission && !checked
                  ? "confirmation-checkboxes__checkbox--invalid"
                  : ""
              }`
            }
            classes={{
              root: "confirmation-checkboxes__checkbox",
              disabled: "confirmation-checkboxes__checkbox--disabled",
              checked: "confirmation-checkboxes__checkbox--checked",
            }}
            key={description}
            checked={checked}
            disabled={shouldDisableCheckboxes}
            onChange={() => handleCheck(description)}
            inputProps={
              {
                "data-testid": "permit-attestation-checkbox",
              } as CustomInputHTMLAttributes
            }
          />
          {description}
        </Box>
      ))}

      {hasAttemptedSubmission && !areAllChecked ? (
        <Typography
          className="confirmation-checkboxes__error"
          data-testid="permit-attestation-checkbox-error"
        >
          Checkbox selection is required.
        </Typography>
      ) : null}
    </Box>
  );
};
