import "./PermitExpiryDateBanner.scss";

export const PermitExpiryDateBanner = ({
  expiryDate,
}: {
  expiryDate: string;
}) => {
  return (
    <div className="permit-expiry-date-banner">
      <p className="permit-expiry-date-banner__label">
        PERMIT EXPIRY DATE
      </p>
      
      <p
        className="permit-expiry-date-banner__expiry-date"
        data-testid="permit-expiry-date"
      >
        {expiryDate}
      </p>
    </div>
  );
};
