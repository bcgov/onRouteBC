import { FormControl, FormLabel, FormHelperText, Box } from "@mui/material";
import {
  Controller,
  FieldPath,
  FieldValues,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";

import "./CustomFormComponents.scss";
import { ORBC_FormTypes } from "../../types/common";
import { CustomOutlinedInput } from "./subFormComponents/CustomOutlinedInput";
import { CustomSelect } from "./subFormComponents/CustomSelect";
import { PhoneNumberInput } from "./subFormComponents/PhoneNumberInput";
import { CustomTextArea } from "./subFormComponents/CustomTextArea";
import { PhoneExtInput } from "./subFormComponents/PhoneExtInput";

/**
 * Properties of onRouteBC custom form components
 */
export interface CustomFormComponentProps<T extends FieldValues> {
  type: "input" | "select" | "phone" | "textarea" | "ext";
  feature: string;
  options: CustomFormOptionsProps<T>;
  menuOptions?: JSX.Element[];
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onWheel?: (event: React.WheelEvent<HTMLInputElement>) => void;
}

/**
 * onRouteBC Custom Form Options must include the name of the field and validation rules
 */
interface CustomFormOptionsProps<T extends FieldValues> {
  name: FieldPath<T>;
  rules: RegisterOptions;
  label?: string;
  inputProps?: RegisterOptions;
  width?: string;
  customHelperText?: string;
  inputType?: "number"; // currently only support number, add "date", "email" and other types later
}

/**
 * Recursive method to dynamically get the error message of a fieldname that has nested json
 * Example: Field name of primaryContact.provinceCode
 * @param errors The "errors" object from formState: { errors } in useFormContext (See top of this file). Passed by value since recursive.
 * @param fieldPath The field name variable. Either provinceField or countryField
 * @returns Error message as a string
 */
export const getErrorMessage = (errors: any, fieldPath: string): string => {
  const parts = fieldPath.split(".");
  if (parts.length > 1 && typeof errors[parts[0]] === "object") {
    return getErrorMessage(errors[parts[0]], parts.splice(1).join("."));
  } else {
    return errors[parts[0]]?.message;
  }
};

/**
 * This onRouteBC Custom Form component abstracts the MUI / React Hook form code to allow for simple reusable form components.
 *
 * Default values should be provided in the parent component using the useForm() method of react-hook-form
 *
 * The component is styled using inline sx styles and use the theme defined in "\src\themes\bcGovTheme.ts"
 *
 * @param type Select the type of form component (example: "select" for MUI Select dropdown)
 * @param feature The onRouteBC feature that the form is associated with.Used for key's and id's.
 * @param options These options are used to customize the component through styles, validation rules, and TanStack React Query integration
 * @param name The name of the field, which is the Unique name of your input.
 * @param rules Validation rules such as required, min, max, etc
 * @param label Text to label the field.
 * @param inputProps MUI component attributes applied to the html input element.
 * @param width Width of the MUI Box container that contains all of the code for the form component. Defaults t0 520px
 * @param customHelperText Non-bold text to appear in parenthesis beside the label
 * @param menuOptions Menu items array for MUI Select component
 *
 * @returns An onRouteBC customized react form component
 */
export const CustomFormComponent = <T extends ORBC_FormTypes>({
  type,
  feature,
  options: {
    name,
    rules,
    label,
    inputProps = rules,
    width = "528px",
    customHelperText,
    inputType, // currently only used for "input" types, add for "select" types later
  },
  menuOptions,
  className,
  disabled,
  readOnly,
  onFocus,
  onWheel,
}: CustomFormComponentProps<T>): JSX.Element => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const showOptionalLabel = () => {
    if (rules.required === false) return true;
    if ((rules.required as any)?.value === false) return true;
    return false;
  };

  const renderSubFormComponent = (invalid: boolean) => {
    switch (type) {
      case "select":
        return (
          <CustomSelect
            feature={feature}
            name={name}
            rules={rules}
            menuOptions={menuOptions}
            disabled={disabled}
            readOnly={readOnly}
          />
        );
      case "phone":
        return (
          <PhoneNumberInput
            feature={feature}
            name={name}
            rules={rules}
            inputProps={inputProps}
            invalid={invalid}
          />
        );
      case "input":
        return (
          <CustomOutlinedInput
            feature={feature}
            name={name}
            rules={rules}
            inputProps={inputProps}
            invalid={invalid}
            inputType={inputType}
            disabled={disabled}
            readOnly={readOnly}
            onFocus={onFocus}
            onWheel={onWheel}
          />
        );
      case "textarea":
        return (
          <CustomTextArea
            feature={feature}
            name={name}
            rules={rules}
            inputProps={inputProps}
            invalid={invalid}
            disabled={disabled}
            readOnly={readOnly}
          />
        );
      case "ext":
        return (
          <PhoneExtInput
            feature={feature}
            name={name}
            rules={rules}
            inputProps={inputProps}
            invalid={invalid}
            inputType={inputType}
            disabled={disabled}
            readOnly={readOnly}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={className ? null : { width }}
      className={`custom-form-components ${className}`}
    >
      <Controller
        key={`controller-${feature}-${name}`}
        name={name}
        control={control}
        rules={rules}
        render={({ fieldState: { invalid } }) => (
          <FormControl
            className="custom-form-control"
            margin="normal"
            error={invalid}
          >
            <FormLabel
              id={`${feature}-${name}-label`}
              classes={{
                root: "custom-form-control__label",
                error: "custom-form-control__label--error",
              }}
            >
              {label}
              {showOptionalLabel() ? (
                <span style={{ fontWeight: "normal" }}> (optional)</span>
              ) : null}
              {customHelperText ? (
                <span style={{ fontWeight: "normal" }}>
                  {` (${customHelperText})`}
                </span>
              ) : null}
            </FormLabel>

            {renderSubFormComponent(invalid)}

            {invalid ? (
              <FormHelperText
                className="custom-form-control__helper-text"
                data-testid={`alert-${name}`}
                error
              >
                {getErrorMessage(errors, name)}
              </FormHelperText>
            ) : null}
          </FormControl>
        )}
      />
    </Box>
  );
};
