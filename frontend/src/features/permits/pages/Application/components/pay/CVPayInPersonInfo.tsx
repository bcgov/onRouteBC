import "./CVPayInPersonInfo.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import {
  TOLL_FREE_NUMBER,
  PPC_EMAIL,
} from "../../../../../../common/constants/constants";
import { ONROUTE_WEBPAGE_LINKS } from "../../../../../../routes/constants";

export const CVPayInPersonInfo = () => {
  return (
    <div className="cv-pay-in-person-info">
      <h3 className="cv-pay-in-person-info__heading">
        Pay In-person (Cash/Cheque/Debit)
      </h3>
      <p className="cv-pay-in-person-info__body">
        Pay in person at the <strong>Provincial Permit Centre</strong> <br></br>
        Toll-free: <strong>{TOLL_FREE_NUMBER}</strong> or Email:{" "}
        <strong>{PPC_EMAIL}</strong>
        <br />
        <br />
        Pay in person at a <strong>Service BC Office (GA)</strong>
      </p>
      <a
        href={ONROUTE_WEBPAGE_LINKS.SERVICE_BC_OFFICE_LOCATIONS}
        className="cv-pay-in-person-info__link"
        target="_blank"
        rel="noreferrer"
      >
        Service BC Office (GA) Locations{" "}
      </a>
      <FontAwesomeIcon
        className="cv-pay-in-person-info__icon"
        icon={faExternalLink}
      />
    </div>
  );
};
