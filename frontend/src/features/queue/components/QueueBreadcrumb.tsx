import { useNavigate } from "react-router-dom";
import { Nullable } from "../../../common/types/common";
import { ApplicationStep, IDIR_ROUTES } from "../../../routes/constants";
import { Breadcrumb } from "../../../common/components/breadcrumb/Breadcrumb";

export const QueueBreadcrumb = ({
  applicationNumber,
  applicationStep,
}: {
  applicationNumber?: Nullable<string>;
  applicationStep: ApplicationStep;
}) => {
  const navigate = useNavigate();

  const allLinks = [
    {
      text: "Home",
      onClick: () => navigate(IDIR_ROUTES.STAFF_HOME, { replace: true }),
    },

    {
      text: `Application #: ${applicationNumber}`,
    },
  ];

  const getLinks = () => {
    const filteredLinks = allLinks.filter(
      (_, index) => index <= applicationStep,
    );

    return filteredLinks.map((link, index) => {
      if (index === applicationStep) {
        return {
          text: link.text,
        };
      }
      return link;
    });
  };

  return <Breadcrumb links={getLinks()} />;
};
