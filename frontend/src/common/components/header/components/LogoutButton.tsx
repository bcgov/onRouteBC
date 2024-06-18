import { useAuth } from "react-oidc-context";

import "./LogoutButton.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import {env} from '../../../env'

export const LogoutButton = () => {
  const { signoutRedirect, removeUser } = useAuth();
  const siteMinderLogOffURL =
    env.VITE_SITEMINDER_LOG_OFF_URL ||
    import.meta.env.VITE_SITEMINDER_LOG_OFF_URL ||
    envConfig.VITE_SITEMINDER_LOG_OFF_URL;

  return (
    <button
      className="logout-button"
      onClick={() => {
        sessionStorage.removeItem("onRouteBC.user.companyId");
        removeUser();
        signoutRedirect({
          extraQueryParams: {
            redirect_uri: `${siteMinderLogOffURL}?retnow=1&returl=${window.location.origin}`,
          },
        });
      }}
    >
      <FontAwesomeIcon
        className="logout-button__icon"
        icon={faArrowRightFromBracket}
      />
      Logout
    </button>
  );
};
