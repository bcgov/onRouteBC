import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent, CardMedia, Stack } from "@mui/material";
import { BC_COLOURS } from "../../../themes/bcGovStyles";
import { PPC_EMAIL, TOLL_FREE_NUMBER } from "../../../common/constants/constants";

/**
 * React component to display an info box about how to locate
 * permit and client numbers.
 */
export const ClientAndPermitReferenceInfoBox = () => {
  return (
    <Card
      sx={{
        width: "33em",
        background: `${BC_COLOURS.bc_messages_blue_background}`,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            paddingTop: "1.5em",
          }}
        >
          <FontAwesomeIcon icon={faCircleInfo} size="xl" />

          <Stack spacing={2}>
            <h3>
              <strong>Where can I find my Client No. and Permit No.?</strong>
            </h3>
            <div>
              Your Client No. and Permit No. can be found on any Commercial
              Vehicle Permit. Please see the sample below.
              <br />
              If you need further assistance, please contact the
              <br />
              Provincial Permit Centre at{" "}
              <strong>Toll-free: {TOLL_FREE_NUMBER}</strong> or <br />{" "}
              <strong>Email: {PPC_EMAIL}</strong>
            </div>
            <Stack spacing={3}>
              <CardMedia
                component="img"
                src="/Old_Permit_Sample.png"
                alt="Old Permit Sample"
                title="Old Permit Sample"
              />
              <CardMedia
                component="img"
                src="/New_Permit_Sample.png"
                alt="New Permit Sample"
                title="New Permit Sample"
              />
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
