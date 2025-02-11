import { useEffect, useState } from "react";
import {
  OutlinedInput,
  OutlinedInputProps,
  FormControl,
  FormHelperText,
  FormLabel,
} from "@mui/material";

import "./NumberInput.scss";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../helpers/util";
import { convertToNumberIfValid } from "../../../helpers/numeric/convertToNumberIfValid";
import { isNull, RequiredOrNull } from "../../../types/common";

type NumberInputClassKey = "root" | "label";

export interface NumberInputProps {
  classes?: Partial<Record<NumberInputClassKey, string>>;
  label?: {
    id: string;
    component: React.ReactNode;
  };
  helperText?: {
    messages?: string[];
    errors?: string[];
  };
  inputProps: Omit<OutlinedInputProps, "type" | "value"> & {
    value: RequiredOrNull<number>;
    maskFn?: (numericVal: number) => string;
  };
}

export const NumberInput = (props: NumberInputProps) => {
  const helperMessages = getDefaultRequiredVal([], props.helperText?.messages);
  const errorMessages = getDefaultRequiredVal([], props.helperText?.errors);
  const helperTexts = [
    ...helperMessages.map((message) => ({
      type: "message",
      message,
    })),
    ...errorMessages.map((message) => ({
      type: "error",
      message,
    })),
  ];

  const { maskFn, onChange, onBlur, ...inputProps } = props.inputProps;
  const inputSlotProps = inputProps.slotProps?.input;
  const inputValue = inputProps.value;
  const initialValueDisplay = applyWhenNotNullable(
    (num) => (maskFn ? maskFn(num) : `${num}`),
    inputValue,
    "",
  );

  const [valueDisplay, setValueDisplay] = useState<string>(initialValueDisplay);

  useEffect(() => {
    setValueDisplay(
      applyWhenNotNullable(
        (num) => (maskFn ? maskFn(num) : `${num}`),
        inputValue,
        "",
      ),
    );
  }, [inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedVal = e.target.value;

    // Allow clearing the input
    if (updatedVal === "") {
      setValueDisplay(updatedVal);
      onChange?.(e);
      return;
    }

    const numericVal = convertToNumberIfValid(updatedVal, null);

    // If an invalid numeric string was inputted, do nothing
    if (isNull(numericVal)) {
      return;
    }

    // Otherwise display it without formatting it immediately (as that affects user's ability to input)

    setValueDisplay(updatedVal);
    onChange?.(e);
  };

  // The user is free to enter numbers into the input field,
  // but as they leave the input will be formatted if a maskFn is available
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const num = convertToNumberIfValid(valueDisplay, null);
    if (maskFn && !isNull(num)) {
      setValueDisplay(maskFn(num));
    }
    onBlur?.(e);
  };

  return (
    <FormControl
      margin="normal"
      className={`
        number-input ${props.classes?.root ? props.classes.root : ""} ${
          errorMessages.length > 0 ? "number-input--error" : ""
        }
      `}
      error={errorMessages.length > 0}
    >
      {props.label ? (
        <FormLabel
          id={props.label.id}
          className={`number-input__label ${
            props.classes?.label ? props.classes.label : ""
          }`}
        >
          {props.label.component}
        </FormLabel>
      ) : null}

      <OutlinedInput
        {...inputProps}
        className={`number-input__input ${
          inputProps.className ? inputProps.className : ""
        }`}
        type="text"
        value={valueDisplay}
        onChange={handleChange}
        onBlur={handleBlur}
        slotProps={{
          ...inputProps.slotProps,
          input: {
            ...inputSlotProps,
            type: "text",
          },
        }}
      />

      {helperTexts.length > 0 ? (
        <div className="number-input__helper-texts">
          {helperTexts.map(({ message, type }) => (
            <FormHelperText
              key={message}
              className={`
                number-input__helper-text ${type === "error" ? "number-input__helper-text--error" : ""}
              `}
              error={type === "error"}
            >
              {message}
            </FormHelperText>
          ))}
        </div>
      ) : null}
    </FormControl>
  );
};
