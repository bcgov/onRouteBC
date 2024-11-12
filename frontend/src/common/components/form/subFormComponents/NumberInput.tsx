import { OutlinedInput } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { ORBC_FormTypes } from "../../../types/common";
import { CustomOutlinedInputProps } from "./CustomOutlinedInput";
import "./NumberInput.scss";

/**
 * An onRouteBC customized MUI OutlineInput component
 * that automatically filters out non-numeric values as the user types
 */
export const NumberInput = <T extends ORBC_FormTypes>(
  props: CustomOutlinedInputProps<T>,
): JSX.Element => {
  const { register, setValue } = useFormContext();
  /**
   * Function to prevent non-numeric input as the user types
   */
  const filterNonNumericValue = (input?: string) => {
    if (!input) return "";
    // only allows 0-9 inputs
    return input.replace(/[^\d]/g, "");
  };

  // Everytime the user types, update the format of the users input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = filterNonNumericValue(e.target.value);
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
