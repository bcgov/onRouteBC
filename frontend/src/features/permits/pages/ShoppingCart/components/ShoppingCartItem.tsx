import { Checkbox } from "@mui/material";

import "./ShoppingCartItem.scss";
import { SelectableCartItem } from "../../../types/CartItem";
import { DATE_FORMATS, toLocal } from "../../../../../common/helpers/formatDate";
import { CustomActionLink } from "../../../../../common/components/links/CustomActionLink";
import { feeSummaryDisplayText } from "../../../helpers/feeSummary";

export const ShoppingCartItem = ({
  cartItemData,
  isSelected,
  isDisabled,
  onSelect,
  onDeselect,
  onEditCartItem,
}: {
  cartItemData: SelectableCartItem;
  isSelected: boolean;
  isDisabled?: boolean;
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  onEditCartItem: (id: string) => void;
}) => {
  const handleToggleItem = (selected: boolean) => {
    if (isDisabled) return;

    if (selected) {
      onSelect(cartItemData.applicationId);
    } else {
      onDeselect(cartItemData.applicationId);
    }
  };

  return (
    <div className="shopping-cart-item">
      <Checkbox
        className="shopping-cart-item__checkbox"
        checked={isSelected}
        disabled={isDisabled}
        readOnly={isDisabled}
        onChange={(_, selected) => handleToggleItem(selected)}
      />

      <div className="shopping-cart-item__info-section">
        <div className="shopping-cart-item__header">
          <span
            className="shopping-cart-item__label shopping-cart-item__label--application-number"
          >
            Application #:
          </span>

          <CustomActionLink
            className="shopping-cart-item__info shopping-cart-item__info--application-number"
            onClick={() => onEditCartItem(cartItemData.applicationId)}
          >
            {cartItemData.applicationNumber}
          </CustomActionLink>
        </div>

        <div className="shopping-cart-item__details-container">
          <div className="shopping-cart-item__details-group">
            <div className="shopping-cart-item__detail">
              <span
                className="shopping-cart-item__label shopping-cart-item__label--permit-type"
              >
                Permit Type:
              </span>

              <span
                className="shopping-cart-item__info shopping-cart-item__info--permit-type"
              >
                {cartItemData.permitType}
              </span>
            </div>

            <div className="shopping-cart-item__detail">
              <span
                className="shopping-cart-item__label shopping-cart-item__label--start-date"
              >
                Permit Start Date:
              </span>

              <span
                className="shopping-cart-item__info shopping-cart-item__info--start-date"
              >
                {toLocal(cartItemData.startDate, DATE_FORMATS.DATEONLY_ABBR_MONTH)}
              </span>
            </div>
          </div>

          <div className="shopping-cart-item__details-group">
            <div className="shopping-cart-item__detail">
              <span
                className="shopping-cart-item__label shopping-cart-item__label--plate"
              >
                Plate:
              </span>

              <span
                className="shopping-cart-item__info shopping-cart-item__info--plate"
              >
                {cartItemData.plate}
              </span>
            </div>

            <div className="shopping-cart-item__detail">
              <span
                className="shopping-cart-item__label shopping-cart-item__label--end-date"
              >
                Permit End Date:
              </span>

              <span
                className="shopping-cart-item__info shopping-cart-item__info--end-date"
              >
                {toLocal(cartItemData.expiryDate, DATE_FORMATS.DATEONLY_ABBR_MONTH)}
              </span>
            </div>
          </div>

          <div className="shopping-cart-item__details-group">
            <div className="shopping-cart-item__detail">
              <span
                className="shopping-cart-item__label shopping-cart-item__label--applicant"
              >
                Applicant:
              </span>

              <span
                className="shopping-cart-item__info shopping-cart-item__info--applicant"
              >
                {cartItemData.applicant}
              </span>
            </div>

            <div className="shopping-cart-item__detail">
              <span
                className="shopping-cart-item__label shopping-cart-item__label--fee"
              >
                Fee:
              </span>

              <span
                className="shopping-cart-item__info shopping-cart-item__info--fee"
              >
                {feeSummaryDisplayText(`${cartItemData.fee}`)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
