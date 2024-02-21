import {
  FormControl,
  FormLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";

import "./SelectPermitType.scss";
import { Optional } from "../../../../../../common/types/common";

export const SelectPermitType = ({
  value,
  label,
  onChange,
  menuItems,
}: {
  value: string;
  label: string;
  onChange: (event: SelectChangeEvent) => void;
  menuItems: Optional<JSX.Element[]>;
}) => (
  <FormControl margin="normal" className="select-permit-type">
    <FormLabel className="select-permit-type__label">{label}</FormLabel>

    <Select
      className="select-permit-type__input"
      value={value}
      onChange={onChange}
      MenuProps={{
        className: "select-permit-type__menu",
      }}
    >
      {menuItems}
    </Select>
  </FormControl>
);
