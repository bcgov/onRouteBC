import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IDPS } from "../../types/idp";
import { useAuth } from "react-oidc-context";
import { InitialLandingPage } from "../../../features/homePage/InitialLandingPage";

const IDPRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signinRedirect } = useAuth();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const paramValue = searchParams.get('idpHint');

        switch(paramValue) {
            case IDPS.IDIR:
            case IDPS.BCEID:
            case IDPS.BUSINESS_BCEID:
                signinRedirect({
                    extraQueryParams: { kc_idp_hint: paramValue },
                });
            break;
            
            default:
            break;
        }
    }, [navigate, location.search]);

    return <InitialLandingPage />;
};

export default IDPRedirect;
