import { BcGovAlertBanner } from "./BcGovAlertBanner";
import { ALERT_BANNER_TYPES } from "./types/AlertBannerType";

export const InfoBcGovBanner = ({
  msg,
  additionalInfo,
  className,
}: {
  msg: string | JSX.Element;
  additionalInfo?: JSX.Element;
  className?: string;
}) => (
  <BcGovAlertBanner
    msg={msg}
    additionalInfo={additionalInfo}
    bannerType={ALERT_BANNER_TYPES.INFO}
    className={className}
  />
);
