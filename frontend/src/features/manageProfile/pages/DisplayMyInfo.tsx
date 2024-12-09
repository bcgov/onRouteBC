import { memo } from "react";
import { Box, Button, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

import "./DisplayMyInfo.scss";
import { ReadUserInformationResponse } from "../types/manageProfile";
import { formatPhoneNumber } from "../../../common/components/form/subFormComponents/PhoneNumberInput";
import { getProvinceFullName } from "../../../common/helpers/countries/getProvinceFullName";
import { getCountryFullName } from "../../../common/helpers/countries/getCountryFullName";

export const DisplayMyInfo = memo(
  ({
    myInfo,
    setIsEditing,
  }: {
    myInfo?: ReadUserInformationResponse;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const countryFullName = getCountryFullName(myInfo?.countryCode);
    const provinceFullName = getProvinceFullName(myInfo?.countryCode, myInfo?.provinceCode);

    return myInfo ? (
      <div className="my-info-display">
        <Box>
          <Typography variant="h3">
            {`${myInfo.firstName} ${myInfo.lastName}`}
          </Typography>

          <Typography>Email: {myInfo.email}</Typography>

          <Typography>
            Primary Phone: {formatPhoneNumber(myInfo.phone1)}{" "}
            {myInfo.phone1Extension ? `Ext: ${myInfo.phone1Extension}` : ""}
          </Typography>

          {myInfo.phone2 ? (
            <Typography>
              Alternate Phone: {formatPhoneNumber(myInfo.phone2)}{" "}
              {myInfo.phone2Extension ? `Ext: ${myInfo.phone2Extension}` : ""}
            </Typography>
          ) : null}

          {myInfo.fax ? (
            <Typography>Fax: {formatPhoneNumber(myInfo.fax)}</Typography>
          ) : null}

          {countryFullName ? (
            <Typography>
              {countryFullName}
            </Typography>
          ) : null}

          {provinceFullName ? (
            <Typography>
              {provinceFullName}
            </Typography>
          ) : null}

          <Typography>{myInfo.city}</Typography>
        </Box>

        <div className="my-info-display__edit">
          <Button
            variant="contained"
            color="tertiary"
            onClick={() => setIsEditing(true)}
          >
            <FontAwesomeIcon className="edit-icon" icon={faPencil} />
            Edit
          </Button>
        </div>
      </div>
    ) : null;
  },
);

DisplayMyInfo.displayName = "DisplayMyInfo";
