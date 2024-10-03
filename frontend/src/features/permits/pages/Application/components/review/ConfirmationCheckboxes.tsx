import { Box, Checkbox, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { Nullable } from "../../../../../../common/types/common";
import { CustomInputHTMLAttributes } from "../../../../../../common/types/formElements";
import "./ConfirmationCheckboxes.scss";

export const ConfirmationCheckboxes = ({
  isSubmitted,
  isChecked,
  setIsChecked,
  isDisabled,
}: {
  isSubmitted: boolean;
  isChecked: boolean;
  setIsChecked: Dispatch<SetStateAction<boolean>>;
  isDisabled?: Nullable<boolean>;
}) => {
  const checkboxes = [
    {
      description:
        "Confirm that this permit is issued to the registered owner (or lessee) of the vehicle being permitted.",
      checked: false,
    },
    {
      description:
        "Confirm compliance with the appropriate policy for the selected commodity(s).",
      checked: false,
    },
    {
      description: "Confirm the information in this application is correct.",
      checked: false,
    },
  ];
  const [checked, setChecked] = useState(checkboxes);

  const handleCheck = (checkedName: string) => {
    let isValid = true;
    const updated = checked.map((item) => {
      if (item.description === checkedName) {
        item.checked = !item.checked;
      }
      if (!item.checked) isValid = false;
      return item;
    });
    setChecked(updated);
    setIsChecked(isValid);
  };

  return (
    <Box className="confirmation-checkboxes">
      <Typography className="confirmation-checkboxes__header" variant="h3">
        Please read the following carefully and check all to proceed.
      </Typography>
      {checked.map((x) => (
        <Box
          key={x.description}
          className="confirmation-checkboxes__attestation"
        >
          <Checkbox
            className={
              "confirmation-checkboxes__checkbox " +
              `${
                isSubmitted && !x.checked
                  ? "confirmation-checkboxes__checkbox--invalid"
                  : ""
              }`
            }
            key={x.description}
            checked={isDisabled ? true : x.checked}
            disabled={Boolean(isDisabled)}
            onChange={() => handleCheck(x.description)}
            inputProps={
              {
                "data-testid": "permit-attestation-checkbox",
              } as CustomInputHTMLAttributes
            }
          />
          {x.description}
        </Box>
      ))}
      {isSubmitted && !isChecked ? (
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
