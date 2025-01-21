import { OutlinedInput } from "@mui/material";
import { useFormContext } from "react-hook-form";

import "./PhoneNumberInput.scss";
import { ORBC_FormTypes } from "../../../types/common";
import { CustomOutlinedInputProps } from "./CustomOutlinedInput";
import { getFormattedPhoneNumber } from "../../../helpers/phone/getFormattedPhoneNumber";

/**
 * An onRouteBC customized MUI OutlineInput component
 * that automatically changes the format of the phone number as the user types
 */
export const PhoneNumberInput = <T extends ORBC_FormTypes>(
  props: CustomOutlinedInputProps<T>,
): JSX.Element => {
  const { register, setValue } = useFormContext();

  // Everytime the user types, update the format of the users input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = getFormattedPhoneNumber(e.target.value);
    setValue<string>(props.name, formattedValue, { shouldValidate: true });
  };

  const className = `custom-phone-input ${props.disabled ? "custom-phone-input--disabled" : ""} ${props.invalid ? "custom-phone-input--invalid" : ""}`;

  return (
    <OutlinedInput
      className={className}
      aria-labelledby={`${props.feature}-${props.name}-label`}
      inputProps={props.inputProps}
      {...register(props.name, props.rules)}
      onChange={handleChange}
      autoComplete="tel"
    />
  );
};
