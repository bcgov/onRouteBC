import "./UniversalUnexpected.scss";
import { ONROUTE_WEBPAGE_LINKS } from "../../routes/constants";
import { ErrorPage } from "../components/error/ErrorPage";
import { CustomExternalLink } from "../components/links/CustomExternalLink";
import { useLocation } from "react-router-dom";

export const UniversalUnexpected = () => {
  const { state } = useLocation();
  if (!state?.correlationId) {
    return (
      <ErrorPage
        errorTitle="Unexpected Error"
        msgNode={
          <div className="unexpected-error-msg">
            <span className="unexpected-error-msg__text">Please return to</span>

            <CustomExternalLink
              className="unexpected-error-msg__link"
              href={ONROUTE_WEBPAGE_LINKS.HOME}
            >
              onRouteBC
            </CustomExternalLink>
          </div>
        }
      />
    );
  }
  return (
    <ErrorPage
      errorTitle="Unexpected Error"
      msgNode={
        <div className="unexpected-error-msg">
          <span className="unexpected-error-msg__text">
            If this problem persists, please email
          </span>
          <br></br>
          <span className="unexpected-error-msg__text">
            the error reference number below to
          </span>
          <CustomExternalLink className="unexpected-error-msg__link">
            PPCPermit@gov.bc.ca
          </CustomExternalLink>

          <p className="unexpected-error-msg__correlation-id">
            {/** Display just the first segment of the correlation id */}
            {state.correlationId.split("-")[0].toUpperCase()}
          </p>
        </div>
      }
    />
  );
};
