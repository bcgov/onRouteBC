import React, { useContext, useMemo } from "react";

import { CartContext } from "./CartContext";
import OnRouteBCContext from "../../../common/authentication/OnRouteBCContext";
import { useGetCartCount } from "../hooks/cart";
import { getDefaultRequiredVal } from "../../../common/helpers/util";

export const CartContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { companyId, userDetails, idirUserDetails } = useContext(OnRouteBCContext);
  const doesUserDetailsExist = Boolean(userDetails) || Boolean(idirUserDetails);

  // Set cart count for company
  const cartCountQuery = useGetCartCount(
    getDefaultRequiredVal(0, companyId),
    doesUserDetailsExist,
  );

  const { data: fetchedCartCount } = cartCountQuery;
  const cartCount = getDefaultRequiredVal(0, fetchedCartCount);

  const refetchCartCount = async () => {
    await cartCountQuery.refetch();
  };

  const contextValues = useMemo(() => {
    return {
      cartCount,
      refetchCartCount,
    };
  }, [
    cartCount,
    refetchCartCount,
  ]);

  return (
    <CartContext.Provider value={contextValues}>
      {children}
    </CartContext.Provider>
  );
};