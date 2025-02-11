import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes/Routes";
import { ThemeProvider } from "@mui/material/styles";
import {
  createContext,
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, AuthProviderProps } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";

import "./App.scss";
import { Header } from "./common/components/header/Header";
import { Footer } from "./common/components/footer/Footer";
import { bcGovTheme } from "./themes/bcGovTheme";
import { NavIconSideBar } from "./common/components/naviconsidebar/NavIconSideBar";
import { Nullable, Optional } from "./common/types/common";
import { VerifiedClient, UserClaimsType } from "./common/authentication/types";
import { SuspendSnackBar } from "./common/components/snackbar/SuspendSnackBar";
import { CartContextProvider } from "./features/permits/context/CartContextProvider";
import {
  CustomSnackbar,
  SnackBarOptions,
} from "./common/components/snackbar/CustomSnackBar";

import OnRouteBCContext, {
  BCeIDUserDetailContext,
  IDIRUserDetailContext,
} from "./common/authentication/OnRouteBCContext";

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
  accessTokenExpiringNotificationTimeInSeconds: 120,
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
  const [queryClient] = useState(() => new QueryClient());

  // Globally used SnackBar component
  const [snackBar, setSnackBar] = useState<SnackBarOptions>({
    showSnackbar: false,
    setShowSnackbar: () => undefined,
    message: "",
    alertType: "info",
  });

  const [userClaims, setUserClaims] = useState<Nullable<UserClaimsType[]>>();
  const [companyId, setCompanyId] = useState<Optional<number>>();
  const [onRouteBCClientNumber, setOnRouteBCClientNumber] =
    useState<Optional<string>>();
  const [companyLegalName, setCompanyLegalName] = useState<Optional<string>>();
  const [isCompanySuspended, setIsCompanySuspended] =
    useState<Optional<boolean>>();
  const [userDetails, setUserDetails] =
    useState<Optional<BCeIDUserDetailContext>>();
  const [idirUserDetails, setIDIRUserDetails] =
    useState<Optional<IDIRUserDetailContext>>();
  const [migratedClient, setMigratedClient] =
    useState<Optional<VerifiedClient>>();
  const [isNewBCeIDUser, setIsNewBCeIDUser] = useState<Optional<boolean>>();

  /**
   * Useful utility function to clear company context.
   */
  const clearCompanyContext = useCallback(() => {
    setCompanyId(() => undefined);
    setOnRouteBCClientNumber(() => undefined);
    setCompanyLegalName(() => undefined);
    setMigratedClient(() => undefined);
    setIsCompanySuspended(() => undefined);
    sessionStorage.removeItem("onRouteBC.user.companyId");
  }, [
    setCompanyId,
    setOnRouteBCClientNumber,
    setCompanyLegalName,
    setMigratedClient,
    setIsCompanySuspended,
  ]);

  // Needed the following usestate and useffect code so that the snackbar would disapear/close
  const [displaySnackBar, setDisplaySnackBar] = useState(false);
  useEffect(() => {
    setDisplaySnackBar(snackBar.showSnackbar);
  }, [snackBar]);

  return (
    <AuthProvider {...oidcConfig}>
      <ThemeProvider theme={bcGovTheme}>
        <QueryClientProvider client={queryClient}>
          <OnRouteBCContext.Provider
            value={useMemo(() => {
              return {
                userClaims,
                setUserClaims,
                companyId,
                setCompanyId,
                userDetails,
                setUserDetails,
                companyLegalName,
                setCompanyLegalName,
                isCompanySuspended,
                setIsCompanySuspended,
                idirUserDetails,
                setIDIRUserDetails,
                onRouteBCClientNumber,
                setOnRouteBCClientNumber,
                migratedClient,
                setMigratedClient,
                isNewBCeIDUser,
                setIsNewBCeIDUser,
                clearCompanyContext,
              };
            }, [
              userClaims,
              companyId,
              userDetails,
              companyLegalName,
              isCompanySuspended,
              idirUserDetails,
              onRouteBCClientNumber,
              migratedClient,
              isNewBCeIDUser,
              clearCompanyContext,
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
                <CartContextProvider>
                  <Router>
                    <Header />
                    <SuspendSnackBar />
                    <NavIconSideBar />
                    <AppRoutes />
                  </Router>
                </CartContextProvider>
              </div>
              <Footer />
            </SnackBarContext.Provider>
          </OnRouteBCContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
