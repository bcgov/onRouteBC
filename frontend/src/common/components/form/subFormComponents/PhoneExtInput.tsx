import { OutlinedInput } from "@mui/material";
import { useFormContext } from "react-hook-form";

import "./PhoneExtInput.scss";
import { ORBC_FormTypes } from "../../../types/common";
import { CustomOutlinedInputProps } from "./CustomOutlinedInput";

/**
 * Input component used for phone number extensions.
 */
export const PhoneExtInput = <T extends ORBC_FormTypes>(
  props: CustomOutlinedInputProps<T>,
): JSX.Element => {
  const { register, setValue } = useFormContext();

  // Automatically prevent non-digit input as the user types
  const filterNonNumericValue = (input?: string) => {
    if (!input) return "";

    // Only allows 0-9 inputs
    return input.replace(/[^\d]/g, "");
  };

  // Everytime the user types, update the format of the users input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = filterNonNumericValue(e.target.value);
    setValue<string>(props.name, formattedValue, { shouldValidate: true });
  };

  const className = `
    phone-ext-input ${props.disabled ? "phone-ext-input--disabled" : ""} 
    ${props.invalid ? "phone-ext-input--invalid" : ""}
  `;

  return (
    <OutlinedInput
      className={className}
      aria-labelledby={`${props.feature}-${props.name}-label`}
      inputProps={props.inputProps}
      {...register(props.name, props.rules)}
      onChange={handleChange}
      autoComplete="tel-extension"
    />
  );
};
