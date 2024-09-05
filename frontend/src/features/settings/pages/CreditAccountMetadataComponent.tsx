import { useContext } from "react";
import { RenderIf } from "../../../common/components/reusable/RenderIf";
import { useGetCreditAccountMetadataQuery } from "../hooks/creditAccount";
import { AddCreditAccount } from "./AddCreditAccount";
import { ViewCreditAccount } from "./ViewCreditAccount";
import OnRouteBCContext from "../../../common/authentication/OnRouteBCContext";
import { IDIR_USER_ROLE } from "../../../common/authentication/types";
import { BcGovAlertBanner } from "../../../common/components/banners/BcGovAlertBanner";
import { ALERT_BANNER_TYPES } from "../../../common/components/banners/types/AlertBannerType";

export const CreditAccountMetadataComponent = ({
  companyId,
}: {
  companyId: number;
}) => {
  const { data: creditAccountMetadata, isPending } =
    useGetCreditAccountMetadataQuery(companyId);

  const { idirUserDetails } = useContext(OnRouteBCContext);
  if (!isPending) {
    if (creditAccountMetadata) {
      return (
        <ViewCreditAccount
          companyId={companyId}
          creditAccountMetadata={creditAccountMetadata}
        />
      );
    } else {
      // Todo: ORV2-2771 Display info box for non-finance staff users who
      // do not have permission to create a new credit account.
      if (idirUserDetails?.userRole === IDIR_USER_ROLE.FINANCE) {
        return (
          <RenderIf
            component={<AddCreditAccount companyId={companyId} />}
            permissionMatrixKeys={{
              permissionMatrixFeatureKey: "MANAGE_SETTINGS",
              permissionMatrixFunctionKey:
                "ADD_CREDIT_ACCOUNT_NON_HOLDER_OR_USER",
            }}
          />
        );
      } else {
        return (
          <BcGovAlertBanner
            msg={
              <>
                For Credit Accounts, please contact CVSE Revenue. + Phone:
                <strong>(250) 952-0422</strong> or Email:{" "}
                <strong>isfinance@gov.bc.ca</strong>
              </>
            }
            bannerType={ALERT_BANNER_TYPES.INFO}
          />
        );
      }
    }
  }
  return <></>;
};
