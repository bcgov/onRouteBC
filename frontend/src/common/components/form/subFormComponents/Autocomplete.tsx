import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps as MuiAutocompleteProps,
  FormControl,
  FormHelperText,
  FormLabel,
  TextField,
} from "@mui/material";

import "./Autocomplete.scss";
import { getDefaultRequiredVal } from "../../../helpers/util";

type AutocompleteClassKey =
  "root" | "label";

export interface AutocompleteProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType,
> {
  classes?: Partial<Record<AutocompleteClassKey, string>>;
  label?: {
    id: string;
    component: React.ReactNode;
  };
  helperText?: {
    messages?: string[];
    errors?: string[];
  };
  autocompleteProps: Omit<
    MuiAutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
    "renderInput"
  >;
}

export const Autocomplete = <
  Value,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ChipComponent extends React.ElementType = "div",
>(props: AutocompleteProps<
  Value,
  Multiple,
  DisableClearable,
  FreeSolo,
  ChipComponent
>) => {
  const helperMessages = getDefaultRequiredVal([], props.helperText?.messages);
  const errorMessages = getDefaultRequiredVal([], props.helperText?.errors);
  const helperTexts = [
    ...helperMessages.map(message => ({
      type: "message",
      message,
    })),
    ...errorMessages.map(message => ({
      type: "error",
      message,
    })),
  ];

  return (
    <FormControl
      margin="normal"
      className={`
        autocomplete ${
          props.classes?.root ? props.classes.root : ""
        } ${
          errorMessages.length > 0 ? "autocomplete--error" : ""
        }
      `}
      error={errorMessages.length > 0}
    >
      {props.label ? (
        <FormLabel
          id={props.label.id}
          className={`autocomplete__label ${
            props.classes?.label ? props.classes.label : ""
          }`}
        >
          {props.label.component}
        </FormLabel>
      ) : null}

      <MuiAutocomplete
        {...props.autocompleteProps}
        className={
          `autocomplete__autocomplete ${
            props.autocompleteProps.className ? props.autocompleteProps.className : ""
          }`
        }
        renderInput={(params) => (
          <TextField
            {...{
              ...params,
              inputProps: {
                ...params.inputProps,
                className: `
                  autocomplete__input ${params.inputProps.className ? params.inputProps.className : ""}
                `,
              },
              className: "autocomplete__textfield",
            }}
          />
        )}
      />

      {helperTexts.length > 0 ? (
        <div className="autocomplete__helper-texts">
          {helperTexts.map(({ message, type }) => (
            <FormHelperText
              key={message}
              className={`
                autocomplete__helper-text ${type === "error" ? "autocomplete__helper-text--error" : ""}
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
