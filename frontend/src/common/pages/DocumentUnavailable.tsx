import "./UniversalUnexpected.scss";
import { ErrorPage } from "../components/error/ErrorPage";

export const DocumentUnavailable = () => {
  return (
    <ErrorPage
      errorTitle="Your document is on the way"
      msgNode={
        <div className="document-unavailable">
          Your document is being created.
          <br />
          Please check again later.
        </div>
      }
    />
  );
};
