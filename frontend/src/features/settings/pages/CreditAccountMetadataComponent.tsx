import { useContext } from "react";
import { IDIR_USER_ROLE } from "../../../common/authentication/types";
import { RenderIf } from "../../../common/components/reusable/RenderIf";
import { useGetCreditAccountMetadataQuery } from "../hooks/creditAccount";
import { AddCreditAccount } from "./AddCreditAccount";
import { ViewCreditAccount } from "./ViewCreditAccount";
import OnRouteBCContext from "../../../common/authentication/OnRouteBCContext";
import { InfoBcGovBanner } from "../../../common/components/banners/InfoBcGovBanner";
import { BANNER_MESSAGES } from "../../../common/constants/bannerMessages";
import "./CreditAccountMetadataComponent.scss";

export const CreditAccountMetadataComponent = ({
  companyId,
}: {
  companyId: number;
}) => {
  const { data: creditAccountMetadata, isPending } =
    useGetCreditAccountMetadataQuery(companyId);
  const { idirUserDetails } = useContext(OnRouteBCContext);
  const isFinanceUser = idirUserDetails?.userRole === IDIR_USER_ROLE.FINANCE;
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
      if (!isFinanceUser) {
        return (
          <div className="non-finance-container">
            <InfoBcGovBanner msg={BANNER_MESSAGES.NON_FINANCE_USER} />
          </div>
        );
      }

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
    }
  }

  return <></>;
};
