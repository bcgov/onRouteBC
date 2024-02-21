import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes/Routes";
import { ThemeProvider } from "@mui/material/styles";
import { createContext, Dispatch, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, AuthProviderProps } from "react-oidc-context";

import "./App.scss";
import { Header } from "./common/components/header/Header";
import { Footer } from "./common/components/footer/Footer";
import { bcGovTheme } from "./themes/bcGovTheme";
import { NavIconSideBar } from "./common/components/naviconsidebar/NavIconSideBar";
import { NavIconHomeButton } from "./common/components/naviconsidebar/NavIconHomeButton";
import { NavIconReportButton } from "./common/components/naviconsidebar/NavIconReportButton";
import { Nullable, Optional } from "./common/types/common";
import {
  CustomSnackbar,
  SnackBarOptions,
} from "./common/components/snackbar/CustomSnackBar";

import OnRouteBCContext, {
  BCeIDUserDetailContext,
  IDIRUserDetailContext,
} from "./common/authentication/OnRouteBCContext";
import { VerifiedClient, UserRolesType } from "./common/authentication/types";
import { WebStorageStateStore } from "oidc-client-ts";
import { FeatureFlagContextProvider } from "./common/components/FeatureFlagContext";

const authority =
  import.meta.env.VITE_KEYCLOAK_ISSUER_URL ||
  envConfig.VITE_KEYCLOAK_ISSUER_URL;

const client_id =
  import.meta.env.VITE_KEYCLOAK_AUDIENCE || envConfig.VITE_KEYCLOAK_AUDIENCE;

/**
 * The OIDC Configuration needed for authentication.
 */
const oidcConfig: AuthProviderProps = {
  authority: authority,
  client_id: client_id,
  redirect_uri: window.location.origin + "/",
  scope: "openid",
  automaticSilentRenew: true,
  revokeTokensOnSignout: true,
  userStore: new WebStorageStateStore({ store: sessionStorage }),
};

/**
 * The Snackbar Context for the application.
 */
export const SnackBarContext = createContext({
  setSnackBar: (() => undefined) as Dispatch<SnackBarOptions>,
});

const App = () => {
  const queryClient = new QueryClient();

  // Globally used SnackBar component
  const [snackBar, setSnackBar] = useState<SnackBarOptions>({
    showSnackbar: false,
    setShowSnackbar: () => undefined,
    message: "",
    alertType: "info",
  });

  const [userRoles, setUserRoles] = useState<Nullable<UserRolesType[]>>();
  const [companyId, setCompanyId] = useState<Optional<number>>();
  const [onRouteBCClientNumber, setOnRouteBCClientNumber] =
    useState<Optional<string>>();
  const [companyLegalName, setCompanyLegalName] = useState<Optional<string>>();
  const [userDetails, setUserDetails] =
    useState<Optional<BCeIDUserDetailContext>>();
  const [idirUserDetails, setIDIRUserDetails] =
    useState<Optional<IDIRUserDetailContext>>();
  const [migratedClient, setMigratedClient] =
    useState<Optional<VerifiedClient>>();
  const [isNewBCeIDUser, setIsNewBCeIDUser] = useState<Optional<boolean>>();

  // Needed the following usestate and useffect code so that the snackbar would disapear/close
  const [displaySnackBar, setDisplaySnackBar] = useState(false);
  useEffect(() => {
    setDisplaySnackBar(snackBar.showSnackbar);
  }, [snackBar]);

  return (
    <AuthProvider {...oidcConfig}>
      <ThemeProvider theme={bcGovTheme}>
        <QueryClientProvider client={queryClient}>
          <FeatureFlagContextProvider>
            <OnRouteBCContext.Provider
              value={useMemo(() => {
                return {
                  userRoles,
                  setUserRoles,
                  companyId,
                  setCompanyId,
                  userDetails,
                  setUserDetails,
                  companyLegalName,
                  setCompanyLegalName,
                  idirUserDetails,
                  setIDIRUserDetails,
                  onRouteBCClientNumber,
                  setOnRouteBCClientNumber,
                  migratedClient,
                  setMigratedClient,
                  isNewBCeIDUser,
                  setIsNewBCeIDUser,
                };
              }, [
                userRoles,
                companyId,
                userDetails,
                companyLegalName,
                idirUserDetails,
                onRouteBCClientNumber,
                migratedClient,
                isNewBCeIDUser,
              ])}
            >
              <SnackBarContext.Provider
                value={useMemo(() => {
                  return { setSnackBar: setSnackBar };
                }, [setSnackBar])}
              >
                <CustomSnackbar
                  showSnackbar={displaySnackBar}
                  setShowSnackbar={setDisplaySnackBar}
                  message={snackBar.message}
                  alertType={snackBar.alertType}
                />
                <div className="page-section">
                  <Router>
                    <Header />
                    <NavIconSideBar>
                      <NavIconHomeButton />
                      <NavIconReportButton />
                    </NavIconSideBar>
                    <AppRoutes />
                  </Router>
                </div>
                <Footer />
              </SnackBarContext.Provider>
            </OnRouteBCContext.Provider>
          </FeatureFlagContextProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
