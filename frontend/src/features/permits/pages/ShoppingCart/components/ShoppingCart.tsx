import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

import "./ShoppingCart.scss";
import { CustomActionLink } from "../../../../../common/components/links/CustomActionLink";
import { RemoveCartButton } from "./RemoveCartButton";
import { ShoppingCartItem } from "./ShoppingCartItem";
import { CartChangedWarningBanner } from "./CartChangedWarningBanner";
import { SelectableCartItem } from "../../../types/CartItem";

export const ShoppingCart = ({
  outdatedApplicationNumbers,
  showCartFilter,
  showAllApplications,
  cartItemSelection,
  toggleSelectAll,
  handleCartFilterChange,
  handleSelectItem,
  handleDeselectItem,
  handleRemoveSelected,
  handleEditCartItem,
}: {
  outdatedApplicationNumbers: string[];
  showCartFilter: boolean;
  showAllApplications: boolean;
  cartItemSelection: SelectableCartItem[];
  toggleSelectAll: () => void;
  handleCartFilterChange: (filter: string) => void;
  handleSelectItem: (id: string) => void;
  handleDeselectItem: (id: string) => void;
  handleRemoveSelected: () => Promise<void>;
  handleEditCartItem: (id: string) => void;
}) => {
  const cartItemsTotalCount = cartItemSelection.length;
  const selectedItemsCount = cartItemSelection.filter(cartItem => cartItem.selected).length;

  return (
    <div className="shopping-cart">
      {outdatedApplicationNumbers.length > 0 ? (
        <CartChangedWarningBanner removedItems={outdatedApplicationNumbers} />
      ) : null}

      <div className="shopping-cart__header">
        <div className="shopping-cart__header-section shopping-cart__header-section--main">
          <div className="shopping-cart__main-header">
            <div className="shopping-cart__title">Shopping Cart</div>

            <div className="shopping-cart__info">
              <div className="select-info select-info--selected-count">
                {`${selectedItemsCount} of ${cartItemsTotalCount} Selected`}
              </div>

              <CustomActionLink
                className={`select-info select-info--select-all`}
                disabled={cartItemsTotalCount === 0}
                onClick={toggleSelectAll}
              >
                {selectedItemsCount !== cartItemsTotalCount ? "Select All" : "Deselect All"}
              </CustomActionLink>
            </div>
          </div>

          {showCartFilter ? (
            <RadioGroup
              className="shopping-cart__filter"
              defaultValue={showAllApplications}
              value={showAllApplications}
              onChange={(e) => handleCartFilterChange(e.target.value)}
            >
              <div
                className={`cart-filter cart-filter--all ${
                  showAllApplications
                    ? "cart-filter--active"
                    : ""
                }`}
              >
                <FormControlLabel
                  className="cart-filter__label"
                  label="All applications"
                  value={true}
                  control={
                    <Radio
                      key="all-applications"
                      className="cart-filter__radio"
                      classes={{
                        checked: "cart-filter__radio--checked"
                      }}
                    />}
                />
              </div>

              <div
                className={`cart-filter cart-filter--my ${
                  !showAllApplications
                    ? "cart-filter--active"
                    : ""
                }`}
              >
                <FormControlLabel
                  className="cart-filter__label"
                  label="My applications"
                  value={false}
                  control={
                    <Radio
                      key="my-applications"
                      className="cart-filter__radio"
                      classes={{
                        checked: "cart-filter__radio--checked"
                      }}
                    />
                  }
                />
              </div>
            </RadioGroup>
          ) : null}
        </div>

        <div className="shopping-cart__header-section shopping-cart__header-section--actions">
          <RemoveCartButton
            onRemove={handleRemoveSelected}
            isDisabled={selectedItemsCount === 0}
          />
        </div>
      </div>

      <div className="shopping-cart__items">
        {cartItemsTotalCount > 0 ? cartItemSelection.map(cartItem => (
          <ShoppingCartItem
            onEditCartItem={handleEditCartItem}
            key={cartItem.applicationId}
            cartItemData={cartItem}
            isSelected={cartItem.selected}
            isDisabled={!cartItem.isSelectable}
            onSelect={handleSelectItem}
            onDeselect={handleDeselectItem}
          />
        )) : (
          <div className="shopping-cart__empty">
            Cart is empty.
          </div>
        )}
      </div>
    </div>
  );
};
