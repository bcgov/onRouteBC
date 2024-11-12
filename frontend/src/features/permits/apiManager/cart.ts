import { httpDELETERequest, httpGETRequest, httpPOSTRequest } from "../../../common/apiManager/httpRequestHandler";
import { CartActionResponse, CartItem } from "../types/CartItem";
import { CART_API_ROUTES } from "./endpoints/endpoints";

/**
 * Add applications to the cart.
 * @param companyId id of the company that the shopping cart belongs to
 * @param applicationIds ids of the applications to be added to the cart
 * @returns Response from backend containing application ids that were added successfully or failed
 */
export const addToCart = async (
  companyId: number,
  applicationIds: string[],
): Promise<CartActionResponse> => {
  const response = await httpPOSTRequest(CART_API_ROUTES.ADD(companyId), {
    applicationIds,
  });

  return response.data;
};

/**
 * Fetch the applications currently in the cart.
 * @param companyId id of the company that has the shopping cart
 * @param fetchAllApplications whether or not to fetch all applications belonging to company (only for Company Admins)
 * @returns Response from backend with applications in the cart belonging to the company
 */
export const fetchCart = async (
  companyId: number,
  fetchAllApplications?: boolean,
): Promise<CartItem[]> => {
  const response = await httpGETRequest(CART_API_ROUTES.GET(companyId, fetchAllApplications));
  return response.data;
};

/**
 * Remove applications from a cart.
 * @param companyId id of the company that has the shopping cart
 * @param applicationIds ids of the applications to be removed from the cart
 * @returns Response from backend containing application ids that were successfully removed from cart or failed
 */
export const removeFromCart = async (
  companyId: number,
  applicationIds: string[],
): Promise<CartActionResponse> => {
  const response = await httpDELETERequest(CART_API_ROUTES.REMOVE(companyId), {
    applicationIds,
  });

  return response.data;
};

/**
 * Fetches number of items currently in the shopping cart.
 * @param companyId id of company that has the shopping cart
 * @returns Number of items currently in the cart
 */
export const getCartCount = async (
  companyId: number,
): Promise<number> => {
  const response = await httpGETRequest(CART_API_ROUTES.COUNT(companyId));
  return response.data;
};
