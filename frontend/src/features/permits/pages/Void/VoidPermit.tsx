import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useContext, useMemo } from "react";

import { VoidPermitForm } from "./components/VoidPermitForm";
import { usePermitDetailsQuery } from "../../hooks/hooks";
import { Loading } from "../../../../common/pages/Loading";
import "./VoidPermit.scss";
import { Banner } from "../../../../common/components/dashboard/Banner";
import { VoidPermitContext } from "./context/VoidPermitContext";
import { ERROR_ROUTES, IDIR_ROUTES } from "../../../../routes/constants";
import { VoidPermitFormData } from "./types/VoidPermit";
import { FinishVoid } from "./FinishVoid";
import OnRouteBCContext from "../../../../common/authentication/OnRouteBCContext";
import { USER_AUTH_GROUP } from "../../../manageProfile/types/userManagement.d";
import { isPermitInactive } from "../../types/PermitStatus";
import { hasPermitExpired } from "../../helpers/permitPDFHelper";
import { Permit } from "../../types/permit";
import { getDefaultRequiredVal } from "../../../../common/helpers/util";
import { Breadcrumb } from "../../../../common/components/breadcrumb/Breadcrumb";
import {
  SEARCH_BY_FILTERS,
  SEARCH_ENTITIES,
} from "../../../idir/search/types/types";

const searchRoute = `${IDIR_ROUTES.SEARCH_RESULTS}?searchEntity=${SEARCH_ENTITIES.PERMIT}`
  + `&searchByFilter=${SEARCH_BY_FILTERS.PERMIT_NUMBER}`;

const isVoidable = (permit: Permit) => {
  return (
    !isPermitInactive(permit.permitStatus) &&
    !hasPermitExpired(permit.permitData.expiryDate)
  );
};

export const VoidPermit = () => {
  const navigate = useNavigate();
  const { permitId } = useParams();
  const [currentLink, setCurrentLink] = useState(0);
  const getBannerText = () =>
    currentLink === 0 ? "Void Permit" : "Finish Voiding";

  // Must be SYSADMIN to access this page
  const { idirUserDetails } = useContext(OnRouteBCContext);

  const { query: permitQuery, permit } = usePermitDetailsQuery(permitId);

  const [voidPermitData, setVoidPermitData] = useState<VoidPermitFormData>({
    permitId: getDefaultRequiredVal("", permitId),
    reason: "",
    revoke: false,
    email: permit?.permitData?.contactDetails?.email,
    fax: permit?.permitData?.contactDetails?.fax,
  });

  useEffect(() => {
    setVoidPermitData({
      ...voidPermitData,
      email: permit?.permitData?.contactDetails?.email,
      fax: permit?.permitData?.contactDetails?.fax,
    });
  }, [
    permit?.permitData?.contactDetails?.email,
    permit?.permitData?.contactDetails?.fax,
  ]);

  const getBasePermitNumber = () => {
    if (!permit?.permitNumber) return "";
    return permit.permitNumber.substring(0, 11);
  };
  const fullSearchRoute = `${searchRoute}&searchValue=${getBasePermitNumber()}`;

  const getLinks = () =>
    currentLink === 0
      ? [
          {
            text: "Search",
            onClick: () => navigate(fullSearchRoute),
          },
          {
            text: "Void Permit",
          },
        ]
      : [
          {
            text: "Search",
            onClick: () => navigate(fullSearchRoute),
          },
          {
            text: "Void Permit",
            onClick: () => setCurrentLink(0),
          },
          {
            text: "Finish Voiding",
          },
        ];

  const contextData = useMemo(
    () => ({
      voidPermitData,
      setVoidPermitData,
      back: () => setCurrentLink(0),
      next: () => setCurrentLink(1),
    }),
    [voidPermitData],
  );

  // If user is not SYSADMIN, show unauthorized page
  if (idirUserDetails?.userAuthGroup !== USER_AUTH_GROUP.SYSADMIN) {
    return <Navigate to={ERROR_ROUTES.UNAUTHORIZED} />;
  }

  // If permitId is not provided in the route, show not found page
  if (!permitId) {
    return <Navigate to={ERROR_ROUTES.UNEXPECTED} />;
  }

  // When querying permit details hasn't finished, show loading
  if (typeof permit === "undefined") return <Loading />;

  // When permit is not available, show not found
  if (!permit) return <Navigate to={ERROR_ROUTES.UNEXPECTED} />;

  // If permit is not voidable, show unexpected error page
  if (!isVoidable(permit)) return <Navigate to={ERROR_ROUTES.UNEXPECTED} />;

  const pages = [
    <VoidPermitForm
      key="void-permit"
      permit={permit}
      onRevokeSuccess={() => navigate(fullSearchRoute)}
    />,
    <FinishVoid
      key="finish-void"
      permit={permit}
      onSuccess={() => navigate(fullSearchRoute)}
    />,
  ];

  return (
    <VoidPermitContext.Provider value={contextData}>
      {permitQuery.isLoading ? (
        <Loading />
      ) : (
        <div className="void-permit">
          <Banner bannerText={getBannerText()} />
          <Breadcrumb links={getLinks()} />
          {pages[currentLink]}
        </div>
      )}
    </VoidPermitContext.Provider>
  );
};
