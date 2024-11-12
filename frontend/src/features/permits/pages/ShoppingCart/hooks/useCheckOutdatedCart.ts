import { useEffect, useState } from "react";

import { CartItem } from "../../../types/CartItem";
import { useFetchCartItemStatus } from "../../../hooks/cart";
import { PERMIT_STATUSES } from "../../../types/PermitStatus";
import { getOutdatedCartItems } from "../../../helpers/cart";
import { getDefaultRequiredVal } from "../../../../../common/helpers/util";

export const useCheckOutdatedCart = (
  companyId: number,
  cartFilterChanged: boolean,
  fetchedCartItems?: CartItem[],
) => {
  const [showEditCartItemDialog, setShowEditCartItemDialog] = useState<boolean>(false);
  const [showUpdateCartDialog, setShowUpdateCartDialog] = useState<boolean>(false);
  const [oldCartItems, setOldCartItems] = useState<CartItem[]>([]);

  const {
    cartItemId: idOfCartItemToEdit,
    cartItemData: cartItemToEdit,
    fetchStatusFor,
  } = useFetchCartItemStatus(companyId);
  
  useEffect(() => {
    // Reset old cart items whenever radio button filter is changed
    setOldCartItems([]); 
  }, [
    cartFilterChanged
  ]);

  useEffect(() => {
    if (cartItemToEdit) {
      if (cartItemToEdit.permitStatus === PERMIT_STATUSES.IN_CART) {
        setShowEditCartItemDialog(true);
      } else {
        setShowUpdateCartDialog(true);
      }
    }
  }, [cartItemToEdit]);

  const outdatedApplicationNumbers = getOutdatedCartItems(
    oldCartItems,
    getDefaultRequiredVal([], fetchedCartItems),
  ).map(cartItem => cartItem.applicationNumber);

  return {
    showEditCartItemDialog,
    showUpdateCartDialog,
    outdatedApplicationNumbers,
    idOfCartItemToEdit,
    setOldCartItems,
    fetchStatusFor,
    setShowEditCartItemDialog,
    setShowUpdateCartDialog,
  };
};
