import { useContext, useEffect, useState } from "react";

import { CartContext } from "../../../context/CartContext";
import { useFetchCart, useRemoveFromCart } from "../../../hooks/cart";
import { CartItem, SelectableCartItem } from "../../../types/CartItem";
import { getDefaultRequiredVal } from "../../../../../common/helpers/util";
import { useFetchSpecialAuthorizations } from "../../../../settings/hooks/specialAuthorizations";
import { calculatePermitFee } from "../../../helpers/feeSummary";
import { usePolicyEngine } from "../../../../policy/hooks/usePolicyEngine";

export const useShoppingCart = (
  companyId: number,
  enableCartFilter: boolean,
) => {
  const { refetchCartCount } = useContext(CartContext);

  // Cart filter state
  const [showAllApplications, setShowAllApplications] = useState<boolean>(enableCartFilter);

  // Interacting with backend for cart
  const removeFromCartMutation = useRemoveFromCart();
  const cartQuery = useFetchCart(companyId, showAllApplications);
  const { data: cartItems } = cartQuery;

  // Check if no-fee permit type is designated
  const { data: specialAuth } = useFetchSpecialAuthorizations(companyId);
  const isNoFeePermitType = Boolean(specialAuth?.noFeeType);
  const policyEngine = usePolicyEngine(specialAuth);

  // Cart item state
  const [cartItemSelection, setCartItemSelection] = useState<SelectableCartItem[]>([]);
  const cartItemsTotalCount = cartItemSelection.length;
  const selectedTotalFee = cartItemSelection
    .filter(cartItem => cartItem.selected)
    .map(cartItem => cartItem.fee)
    .reduce((prevTotal, currFee) => prevTotal + currFee, 0);

  useEffect(() => {
    // Always refetch cart count upon initial rendering of shopping cart and when cart filter changes
    // This is due to the possibility of other users modifying the cart, and the count needs to be
    // updated to keep in sync with the latest cart item query
    refetchCartCount();
  }, [showAllApplications]);

  useEffect(() => {
    const updateCartItemSelection = async (itemsInCart: CartItem[]) => {
      const cartSelectionWithFees = await Promise.all(
        itemsInCart.map(async (cartItem) => {
          const fee = await calculatePermitFee({
            permitType: cartItem.permitType,
            permitData: {
              permitDuration: cartItem.duration,
              permittedRoute: {
                manualRoute: {
                  totalDistance: cartItem.totalDistance,
                  highwaySequence: [], // required, but not used for fee calculation
                  origin: "", // required, but not used for fee calculation
                  destination: "", // required, but not used for fee calculation
                },
              },
              thirdPartyLiability: cartItem.thirdPartyLiability,
            },
          }, policyEngine);

          return {
            ...cartItem,
            selected: true, // all selected by default
            isSelectable: true, // add user permission check (ie. CA can't select staff cart items)
            fee,
          };
        }),
      );

      setCartItemSelection(cartSelectionWithFees);
    };

    const items = getDefaultRequiredVal([], cartItems);
    updateCartItemSelection(items);
  }, [cartItems, isNoFeePermitType, policyEngine]);

  const selectedItemsCount = cartItemSelection.filter(cartItem => cartItem.selected).length;

  const toggleSelectAll = () => {
    if (cartItemsTotalCount === 0) return;

    if (selectedItemsCount !== cartItemsTotalCount) {
      setCartItemSelection(cartItemSelection.map(cartItem => ({
        ...cartItem,
        selected: cartItem.isSelectable ? true : cartItem.selected,
      })));
    } else {
      setCartItemSelection(cartItemSelection.map(cartItem => ({
        ...cartItem,
        selected: cartItem.isSelectable ? false : cartItem.selected,
      })));
    }
  };

  const handleCartFilterChange = (filter: string) => {
    setShowAllApplications(filter === "true");
  };

  const handleSelectItem = (id: string) => {
    setCartItemSelection(
      cartItemSelection.map(cartItem => ({
        ...cartItem,
        selected: cartItem.applicationId === id && cartItem.isSelectable ?
          true : cartItem.selected,
      })),
    );
  };

  const handleDeselectItem = (id: string) => {
    setCartItemSelection(
      cartItemSelection.map(cartItem => ({
        ...cartItem,
        selected: cartItem.applicationId === id && cartItem.isSelectable ?
          false : cartItem.selected,
      })),
    );
  };

  return {
    removeFromCartMutation,
    cartQuery,
    cartItems,
    cartItemSelection,
    selectedTotalFee,
    showAllApplications,
    isNoFeePermitType,
    toggleSelectAll,
    handleCartFilterChange,
    handleSelectItem,
    handleDeselectItem,
    refetchCartCount,
  };
};
