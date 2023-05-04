import axios from "axios";

/**
 * Retrieves the access token from session.
 * @returns A string containing the access token.
 */
const getAccessToken = () => {
  // Add environment variables to get the full key.
  // Full key structure: oidc.user:${AUTH0_ISSUER_URL}:${AUTH0_AUDIENCE}
  // Full key example:: oidc.user:https://dev.loginproxy.gov.bc.ca/auth/realms/standard:on-route-bc-direct-4598
  const storageKey: string = Object.keys(sessionStorage).find((key) =>
    key.startsWith("oidc.user")
  ) as string;
  const parsedSessionObject = JSON.parse(
    sessionStorage.getItem(storageKey) as string
  );
  return (
    parsedSessionObject["token_type"] +
    " " +
    parsedSessionObject["access_token"]
  );
};

/**
 * Retrieves the companyId from the session.
 * @returns string | null
 */
export const getCompanyIdFromSession = (): string | null => {
  return sessionStorage.getItem("onRouteBC.user.companyId");
};

/**
 * Retrieves user's GUID from session.
 * @returns string | null
 */
export const getUserGuidFromSession = (): string | null => {
  const storageKey: string = Object.keys(sessionStorage).find((key) =>
    key.startsWith("oidc.user")
  ) as string;
  const parsedSessionObject = JSON.parse(
    sessionStorage.getItem(storageKey) as string
  );
  
  return parsedSessionObject?.profile?.bceid_user_guid ?? null;
};

/**
 * A generic HTTP GET Request
 * @param url The URL of the resource.
 * @returns A Promise<Response> with the response from the API.
 */
export const httpGETRequest = (url: string) => {
  return axios.get(url, {
    headers: {
      Authorization: getAccessToken(),
    },
  });
};

/**
 * A generic HTTP POST Request
 * @param url The URL of the resource.
 * @param data The request payload.
 * @returns A Promise<Response> with the response from the API.
 */
export const httpPOSTRequest = (url: string, data: any) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAccessToken(),
    },
    body: JSON.stringify(data),
  });
};

/**
 * A generic HTTP PUT Request
 * @param url The URL of the resource.
 * @param data The request payload.
 * @returns A Promise<Response> with the response from the API.
 */
export const httpPUTRequest = (url: string, data: any) => {
  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAccessToken(),
    },
    body: JSON.stringify(data),
  });
};

/**
 * HTTP Delete Request
 * @param url The URL containing the resource id to be deleted.
 * @returns A Promise<Response> with the response from the API.
 */
export const httpDELETERequest = (url: string) => {
  return fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: getAccessToken(),
    },
  });
};
