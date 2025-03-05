import axios from "axios";

import { GEOCODER_API_KEY, GEOCODER_URL } from "./endpoints/endpoints";
import { GeocoderAddressResponse, GeocoderQueryOptions } from "../types/geocoder";
import { getDefaultRequiredVal } from "../helpers/util";
import {
  DEFAULT_AUTOCOMPLETE,
  DEFAULT_BRIEF,
  DEFAULT_ECHO,
  DEFAULT_LOCATION_DESCRIPTOR,
  DEFAULT_MAX_RESULTS,
  DEFAULT_MIN_SCORE,
  DEFAULT_OUTPUT_SRS,
} from "../constants/geocoder";

/**
 * A HTTP GET Request for Geocoder API.
 * @param address The address of the location to search for.
 * @returns The search results returned from the Geocoder API.
 */
export const httpGETGeocoder = async (
  address: string,
  options?: GeocoderQueryOptions,
): Promise<GeocoderAddressResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.set(
    "autoComplete",
    `${getDefaultRequiredVal(DEFAULT_AUTOCOMPLETE, options?.autoComplete)}`,
  );

  queryParams.set("addressString", address);
  queryParams.set(
    "maxResults",
    `${getDefaultRequiredVal(DEFAULT_MAX_RESULTS, options?.maxResults)}`,
  );

  queryParams.set(
    "minScore",
    `${getDefaultRequiredVal(DEFAULT_MIN_SCORE, options?.minScore)}`,
  );

  queryParams.set("echo", `${getDefaultRequiredVal(DEFAULT_ECHO, options?.echo)}`);
  queryParams.set("brief", `${getDefaultRequiredVal(DEFAULT_BRIEF, options?.brief)}`);
  queryParams.set(
    "locationDescriptor",
    getDefaultRequiredVal(DEFAULT_LOCATION_DESCRIPTOR, options?.locationDescriptor),
  );
  
  queryParams.set(
    "outputSRS",
    `${getDefaultRequiredVal(DEFAULT_OUTPUT_SRS, options?.outputSRS)}`,
  );

  const response = await axios.get(
    `${GEOCODER_URL}?${queryParams.toString()}`,
    {
      headers: {
        apikey: GEOCODER_API_KEY,
      },
    },
  );

  return response.data;
};
