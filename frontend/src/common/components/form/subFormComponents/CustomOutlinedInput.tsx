import { OutlinedInput } from "@mui/material";
import {
  FieldValues,
  FieldPath,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";

import { ORBC_FormTypes } from "../../../types/common";
import "./CustomOutlinedInput.scss";
import React from "react";

/**
 * Properties of the onrouteBC customized OutlineInput MUI component
 */
export interface CustomOutlinedInputProps<T extends FieldValues> {
  feature: string;
  name: FieldPath<T>;
  rules: RegisterOptions;
  inputProps: RegisterOptions;
  invalid: boolean;
  inputType?: "number"; // currently only support number, add "date", "email" and other types later
  disabled?: boolean;
  readOnly?: boolean;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onWheel?: (event: React.WheelEvent<HTMLInputElement>) => void;
}

/**
 * An onRouteBC customized MUI OutlineInput component
 * Based on https://mui.com/material-ui/api/outlined-input/
 *
 */
export const CustomOutlinedInput = <T extends ORBC_FormTypes>(
  props: CustomOutlinedInputProps<T>,
): JSX.Element => {
  const { register } = useFormContext();

  // Add aria-label to input prop for Jest testing purposes
  const updatedInputProps: any = props.inputProps;
  updatedInputProps["aria-label"] = props.name;
  updatedInputProps["data-testid"] = `input-${props.name}`;

  // Set the 'type' attribute for the input element, along with other number related attributes, for display purposes only
  // (ie. not setting values, since input values always yield string type)
  // Note: it is impossible to make the non-standard HTML 'valueAsNumber' attribute work in React (hence we don't include it here),
  // and instead we can only convert input values to numbers explicitly in the components that use them
  // https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/
  if (props.inputType === "number") {
    // We would like <input type="number" inputMode="numeric" pattern="[0-9]*" ... />
    updatedInputProps["type"] = "number";
    updatedInputProps["inputMode"] = "numeric";
    updatedInputProps["pattern"] = "[0-9]*";
  }

  const customInputClassName = `custom-input ${props.disabled ? "custom-input--disabled" : ""} ${props.invalid ? "custom-input--invalid" : ""}`;

  return (
    <OutlinedInput
      inputProps={{
        ...updatedInputProps,
        className: updatedInputProps.className
          ? `${updatedInputProps.className} custom-input__input-container`
          : "custom-input__input-container",
      }}
      disabled={props.disabled}
      readOnly={props.readOnly}
      className={customInputClassName}
      {...register(props.name, props.rules)}
      onFocus={props.onFocus}
      onWheel={props.onWheel}
    />
  );
};
