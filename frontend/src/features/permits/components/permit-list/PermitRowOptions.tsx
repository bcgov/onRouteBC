import { OnRouteBCTableRowActions } from "../../../../common/components/table/OnRouteBCTableRowActions";
import { viewReceiptPdf } from "../../helpers/permitPDFHelper";
import { useNavigate } from 'react-router-dom';

const PERMIT_ACTION_OPTION_TYPES = {
  VIEW_RECEIPT: "viewReceipt",
} as const;

type PermitActionOptionType =
  (typeof PERMIT_ACTION_OPTION_TYPES)[keyof typeof PERMIT_ACTION_OPTION_TYPES];

const getOptionLabel = (optionType: PermitActionOptionType): string => {
  if (optionType === PERMIT_ACTION_OPTION_TYPES.VIEW_RECEIPT) {
    return "View Receipt";
  }

  return "";
};

const ALL_OPTIONS = [
  {
    label: getOptionLabel(PERMIT_ACTION_OPTION_TYPES.VIEW_RECEIPT),
    value: PERMIT_ACTION_OPTION_TYPES.VIEW_RECEIPT,
  },
];

const getOptions = (isExpired: boolean) => {
  if (isExpired) {
    return ALL_OPTIONS;
  }
  return ALL_OPTIONS;
};

export const PermitRowOptions = ({
  isExpired,
  permitId,
}: {
  isExpired: boolean;
  permitId: string;
}) => {
  const navigate = useNavigate();
  /**
   * Action handler upon a select event.
   * @param selectedOption The option that was selected.
   */
  const onSelectOptionCallback = (selectedOption: string) => {
    if (selectedOption === PERMIT_ACTION_OPTION_TYPES.VIEW_RECEIPT) {
      viewReceiptPdf(permitId, navigate);
    }
  };

  return (
    <OnRouteBCTableRowActions
      onSelectOption={onSelectOptionCallback}
      options={getOptions(isExpired)}
    />
  );
};
