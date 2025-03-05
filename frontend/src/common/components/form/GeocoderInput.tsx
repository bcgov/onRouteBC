import { useEffect, useState } from "react";
import {
  MenuItem,
  AutocompleteProps as MuiAutocompleteProps,
} from "@mui/material";

import { Autocomplete, AutocompleteProps } from "./subFormComponents/Autocomplete";
import { useGeocoder } from "../../hooks/useGeocoder";
import { useMemoizedArray } from "../../hooks/useMemoizedArray";
import { getDefaultRequiredVal } from "../../helpers/util";
import { Nullable } from "../../types/common";
import { DEBOUNCE_DURATION, MIN_SEARCH_LENGTH } from "../../constants/geocoder";

export interface GeocoderInputProps<
  DisableClearable extends boolean | undefined,
  ChipComponent extends React.ElementType,
> extends Omit<
  AutocompleteProps<
    string,
    false,
    DisableClearable,
    true,
    ChipComponent
  >,
  "autocompleteProps"
> {
  autocompleteProps?: Omit<
    MuiAutocompleteProps<string, false, DisableClearable, true, ChipComponent>,
    "renderInput"
    | "options"
    | "renderOption"
    | "isOptionEqualToValue"
    | "value"
    | "onChange"
    | "onInputChange"
  >;
  selectedAddress?: Nullable<string>;
  onSelectAddress?: (address: string) => void;
  onAddressSearchChange?: (searchString: string) => void;
}

export const GeocoderInput = <
  DisableClearable extends boolean | undefined = false,
  ChipComponent extends React.ElementType = "div",
>(props: GeocoderInputProps<
  DisableClearable,
  ChipComponent
>) => {
  const {
    autocompleteProps,
    label,
    classes,
    helperText,
    onSelectAddress,
    onAddressSearchChange,
  } = props;

  // Already previously selected address to search for, or empty if it doesn't exist
  const selectedAddress = getDefaultRequiredVal("", props.selectedAddress);

  // This is the search string that appears in the input textfield
  const [searchString, setSearchString] = useState<string>(selectedAddress);
  
  // This is the same as the searchString, except it's only set after a debounce period
  const [debouncedSearchString, setDebouncedSearchString] = useState<string>(selectedAddress);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setSearchString(selectedAddress);
  }, [selectedAddress]);

  useEffect(() => {
    // We need to debounce the search string to throttle the Geocoder API calls
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchString(searchString);
    }, DEBOUNCE_DURATION);

    return () => clearTimeout(debounceTimeout);
  }, [searchString]);

  // Search for addresses based on the debounced search string
  const { data: geocoderResults, isLoading } = useGeocoder({
    address: debouncedSearchString,
    enableSearch: isOpen && (debouncedSearchString.trim().length >= MIN_SEARCH_LENGTH),
  });

  const addressSuggestions = useMemoizedArray(
    getDefaultRequiredVal(
      [],
      geocoderResults?.features?.map(({ properties }) => properties.fullAddress),
    ),
    (result) => result,
    (result1, result2) => result1 === result2,
  );

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (!searchString) {
      // If inputted search string is empty when exiting geocoder input,
      // set selected address to be empty
      onSelectAddress?.("");
    } else if (searchString !== selectedAddress) {
      // If upon exiting geocoder, the inputted search string is partial,
      // and none of the address options where selected,
      // or if no available options to select due to search string being invalid
      // then set selected address to be previously selected address
      setSearchString(selectedAddress);
    }
  };

  return (
    <Autocomplete
      label={label}
      classes={classes}
      helperText={helperText}
      autocompleteProps={{
        ...autocompleteProps,
        freeSolo: true,
        options: addressSuggestions,
        filterOptions: (options) => options,
        renderOption: (props, option) => (
          <MenuItem {...props} key={option} value={option}>
            {option}
          </MenuItem>
        ),
        isOptionEqualToValue: (option, value) =>
          option === value,
        open: isOpen,
        onOpen: handleOpen,
        onClose: handleClose,
        value: selectedAddress,
        inputValue: searchString,
        onChange: (_, value) => {
          if (!value) {
            onSelectAddress?.("");
          } else {
            onSelectAddress?.(value);
          }
        },
        onInputChange: (_, value) => {
          setSearchString(value);
          onAddressSearchChange?.(value);
        },
        loading: isLoading,
      }}
    />
  );
};
