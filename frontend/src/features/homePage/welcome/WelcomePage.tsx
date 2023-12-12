import {
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Card from "@mui/material/Card";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { getCompanyNameFromSession } from "../../../common/apiManager/httpRequestHandler";
import OnRouteBCContext from "../../../common/authentication/OnRouteBCContext";
import { Nullable } from "../../../common/types/common";
import {
  CREATE_PROFILE_WIZARD_ROUTES,
  PROFILE_ROUTES,
} from "../../../routes/constants";
import "./welcome.scss";
import { BC_COLOURS } from "../../../themes/bcGovStyles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GreenCheckIcon } from "../../../common/components/icons/GreenCheckIcon";
import { RedXMarkIcon } from "../../../common/components/icons/RedXMarkIcon";

const isInvitedUser = (companyNameFromContext?: string): boolean =>
  Boolean(companyNameFromContext);

const isNewCompanyProfile = (companyNameFromContext?: string): boolean =>
  !isInvitedUser(companyNameFromContext);

const WelcomeCompanyName = ({
  companyName,
}: {
  companyName: Nullable<string>;
}): React.ReactElement => {
  if (!companyName) return <></>;
  return (
    <>
      <div className="separator-line"></div>
      <div className="welcome-page__company-info">
        <div className="company-label">Company Name</div>
        <div className="company-name">{companyName}</div>
      </div>
    </>
  );
};

/**
 * Reusable Card component to display a possible action for the user.
 * @returns A react component.
 */
const ProfileAction = ({
  navigateTo,
}: {
  navigateTo: string;
}): React.ReactElement => {
  const navigate = useNavigate();
  return (
    <div className="welcome-page__profile-actions">
      <Card
        className="welcome-cards welcome-cards--new"
        sx={{
          ":hover": {
            boxShadow: 10,
          },
        }}
      >
        <CardContent onClick={() => navigate(navigateTo)}>
          <Stack spacing={3}>
            <div className="welcome-cards__img">
              <img
                height="80"
                width="80"
                className="welcome-account-graphics"
                src="./Create_New_Profile_Graphic.svg"
                alt="New onRouteBC Profile"
              />
            </div>

            <Typography variant="body2">
              Finish creating your onRouteBC Profile
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};

const ChallengeOption = ({
  navigateTo,
  label,
  labelIcon,
}: {
  navigateTo: string;
  label: string;
  labelIcon: JSX.Element;
}): React.ReactElement => {
  const navigate = useNavigate();
  return (
    <Paper
      // className="report-paper"
      sx={{
        ":hover": {
          background: BC_COLOURS.bc_messages_blue_background,
        },
        cursor: "pointer",
        // background: BC_COLOURS.bc_messages_blue_background,
      }}
      onClick={() => navigate(navigateTo)}
    >
      {labelIcon}
      {label}
    </Paper>
  );
};

/**
 * The BCeID welcome page of the application.
 * A BCeID user reaches this page on their very first login.
 */
export const WelcomePage = React.memo(() => {
  const companyNameFromToken = getCompanyNameFromSession();
  const { companyLegalName: companyNameFromContext } =
    useContext(OnRouteBCContext);

  return (
    <div className="welcome-page">
      <div className="welcome-page__main">
        <div className="welcome-page__header">
          <div className="welcome-graphic"></div>
          <h2>Welcome to onRouteBC!</h2>
        </div>
        {isInvitedUser(companyNameFromContext) ? (
          <WelcomeCompanyName companyName={companyNameFromContext} />
        ) : (
          <WelcomeCompanyName companyName={companyNameFromToken} />
        )}
        <div className="separator-line"></div>
        {isInvitedUser(companyNameFromContext) && (
          <ProfileAction navigateTo={PROFILE_ROUTES.USER_INFO} />
        )}
        {false && isNewCompanyProfile(companyNameFromContext) && (
          <ProfileAction navigateTo={CREATE_PROFILE_WIZARD_ROUTES.CREATE} />
        )}
        {
          <Stack spacing={2}>
            <Typography>
              Has this company purchased a commercial vehicle permit in the last
              7 years?
            </Typography>
            <Container>
              <Stack direction="row" spacing={3}>
                <ChallengeOption
                  navigateTo={CREATE_PROFILE_WIZARD_ROUTES.CREATE}
                  label="No"
                  labelIcon={<RedXMarkIcon />}
                />
                <ChallengeOption
                  navigateTo={CREATE_PROFILE_WIZARD_ROUTES.CREATE}
                  label="Yes"
                  labelIcon={<GreenCheckIcon />}
                />
              </Stack>
            </Container>
          </Stack>
        }
      </div>
    </div>
  );
});

WelcomePage.displayName = "WelcomePage";
