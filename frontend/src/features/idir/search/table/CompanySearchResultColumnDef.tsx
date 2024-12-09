import { MRT_ColumnDef } from "material-react-table";

import { COUNTRIES } from "../../../../common/constants/countries";
import { CompanyProfile } from "../../../manageProfile/types/manageProfile";
import { getDefaultNullableVal } from "../../../../common/helpers/util";

/*
 *
 * The Columns Options are from Material React Table.
 * For a list of options, see here:
 * https://www.material-react-table.com/docs/api/column-options
 *
 */
export const CompanySearchResultColumnDef: MRT_ColumnDef<CompanyProfile>[] = [
  {
    accessorKey: "alternateName",
    header: "Doing Business As (DBA)",
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "clientNumber",
    header: "Client No.",
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "mailingAddress.addressLine1",
    header: "Company Address",
    enableSorting: true,
    sortingFn: "alphanumeric",
    Cell: (props: { row: any }) => {
      const mailingAddress = props.row?.original?.mailingAddress;
      const country = COUNTRIES.filter((country) => {
        return country?.code === mailingAddress?.countryCode;
      });

      const province = country[0]?.states?.filter((state) => {
        return state?.code === mailingAddress?.provinceCode;
      });

      const addressLine1 = getDefaultNullableVal(
        null,
        mailingAddress?.addressLine1,
      );
      const addressLine2 = getDefaultNullableVal(
        null,
        mailingAddress?.addressLine2,
      );
      const countryName = getDefaultNullableVal(null, country[0]?.name);
      const provinceName = getDefaultNullableVal(null, province[0]?.name);
      const cityName = getDefaultNullableVal(null, mailingAddress?.city);
      const postalCodeName = getDefaultNullableVal(
        null,
        mailingAddress?.postalCode,
      );

      return (
        <>
          {addressLine1} {addressLine1 && <br />}
          {addressLine2} {addressLine2 && <br />}
          {countryName} {countryName && <br />}
          {provinceName} {provinceName && <br />}
          {cityName} {postalCodeName}
        </>
      );
    },
  },
  {
    accessorKey: "primaryContact.firstName",
    header: "Primary Contact",
    enableSorting: true,
    sortingFn: "alphanumeric",
    Cell: (props: { row: any }) => {
      const contact = props.row?.original?.primaryContact;

      const firstName = getDefaultNullableVal(null, contact?.firstName);
      const lastName = getDefaultNullableVal(null, contact?.lastName);
      const email = getDefaultNullableVal(null, contact?.email);
      const phone = getDefaultNullableVal(null, contact?.phone1);

      return (
        <>
          {firstName} {lastName} {firstName && <br />}
          {email} {email && <br />}
          {phone}
        </>
      );
    },
  },
];
