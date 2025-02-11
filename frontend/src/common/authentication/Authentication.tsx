import { useAuth } from "react-oidc-context";
import Button from "@mui/material/Button";
import { LoginRedirect } from "./LoginRedirect";
import { Box, Container, Typography } from "@mui/material";
import { Loading } from "../pages/Loading";
import { IDPS } from "../types/idp";

const LoginOptions = () => {
  const { signinRedirect } = useAuth();
  return (
    <>
      <Box sx={{ margin: "8px" }}>
        <Button
          id="login-bceid"
          variant="contained"
          onClick={() => {
            signinRedirect({
              extraQueryParams: { kc_idp_hint: IDPS.BUSINESS_BCEID },
            });
          }}
          sx={{ width: "200px" }}
        >
          Log in with BCeID
        </Button>
      </Box>
      <Box sx={{ margin: "8px" }}>
        <Button
          id="login-idir"
          variant="contained"
          onClick={() => {
            signinRedirect({
              extraQueryParams: { kc_idp_hint: IDPS.IDIR },
            });
          }}
          sx={{ width: "200px" }}
        >
          Log in with IDIR
        </Button>
      </Box>
    </>
  );
};

const RenderAuth = () => {
  const auth = useAuth();
  if (auth.isLoading) {
    return <Loading />;
  } else if (auth.isAuthenticated) {
    return <LoginRedirect />;
  }

  return <LoginOptions />;
};

/*
 * The Authentication component handles user login
 *
 */
export const Authentication = () => {
  return (
    <Container
      className="feature-container"
      sx={{
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <Typography variant="h3" sx={{ marginBottom: "8px" }}>
        onRouteBC
      </Typography>

      <RenderAuth />
    </Container>
  );
};
