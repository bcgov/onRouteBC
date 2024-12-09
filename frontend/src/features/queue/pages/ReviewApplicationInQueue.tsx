import { Box } from "@mui/material";
import { Navigate, useParams } from "react-router-dom";
import { Banner } from "../../../common/components/dashboard/components/banner/Banner";
import { Loading } from "../../../common/pages/Loading";
import { useApplicationDetailsQuery } from "../../permits/hooks/hooks";
import { ApplicationInQueueReview } from "../components/ApplicationInQueueReview";
import {
  applyWhenNotNullable,
  getDefaultRequiredVal,
} from "../../../common/helpers/util";
import { ERROR_ROUTES } from "../../../routes/constants";
import { deserializeApplicationResponse } from "../../permits/helpers/serialize/deserializeApplication";
import { UniversalUnexpected } from "../../../common/pages/UniversalUnexpected";

export const ReviewApplicationInQueue = () => {
  const { companyId: companyIdParam, permitId: permitIdParam } = useParams();

  const companyId: number = applyWhenNotNullable(
    (id) => Number(id),
    companyIdParam,
    0,
  );
  const permitId = getDefaultRequiredVal("", permitIdParam);

  const {
    query: { data: applicationData, isLoading: applicationDataIsLoading },
  } = useApplicationDetailsQuery({
    companyId,
    permitId,
  });

  if (!companyId || !permitId) {
    return <Navigate to={ERROR_ROUTES.UNEXPECTED} />;
  }

  if (applicationDataIsLoading) {
    return <Loading />;
  }

  if (!applicationData) {
    return <UniversalUnexpected />;
  }

  return (
    <div className="review-application-in-queue">
      <Box
        className="layout-box"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Banner bannerText="Review and Confirm Details" />
      </Box>

      <ApplicationInQueueReview
        applicationData={deserializeApplicationResponse(applicationData)}
      />
    </div>
  );
};
