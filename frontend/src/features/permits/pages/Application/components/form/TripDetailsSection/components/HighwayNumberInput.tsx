import { OutlinedInput } from "@mui/material";

export const HighwayNumberInput = ({
  className,
  highwayNumber,
  onHighwayInputChange,
  rowIndex,
  colIndex,
}: {
  className: string;
  highwayNumber: string;
  onHighwayInputChange: (
    updatedHighwayNumber: string,
    rowIndex: number,
    colIndex: number,
  ) => void;
  rowIndex: number;
  colIndex: number;
}) => {
  return (
    <OutlinedInput
      className={className}
      classes={{
        root: className,
        focused: `${className}--focus`,
        error: `${className}--error`,
      }}
      value={highwayNumber}
      onChange={(e) => onHighwayInputChange(e.target.value, rowIndex, colIndex)}
    />
  );
};
