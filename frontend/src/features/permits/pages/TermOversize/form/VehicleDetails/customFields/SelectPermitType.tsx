import {
  FormControl,
  FormLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { SELECT_FIELD_STYLE } from "../../../../../../../themes/orbcStyles";

export const SelectPermitType = ({
  label,
  onChange,
  menuItems,
  width,
}: {
  value: string;
  label: string;
  onChange: (event: SelectChangeEvent) => void;
  menuItems: JSX.Element[] | undefined;
  width: string;
}) => (
  <FormControl margin="normal">
    <FormLabel sx={SELECT_FIELD_STYLE.FORM_LABEL}>{label}</FormLabel>
    <Select
      defaultValue="tros"
      onChange={onChange}
      MenuProps={SELECT_FIELD_STYLE.MENU_PROPS}
      sx={[
        SELECT_FIELD_STYLE.SELECT_FIELDSET,
        {
          width: { width },
        },
      ]}
    >
      {menuItems}
    </Select>
  </FormControl>
);