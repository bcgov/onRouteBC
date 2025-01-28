import { ONROUTE_WEBPAGE_LINKS } from "../../../routes/constants";
import "./Footer.scss";

export const Footer = () => {
  const releaseNumber =
    import.meta.env.VITE_RELEASE_NUM || envConfig.VITE_RELEASE_NUM;
  return (
    <footer className="footer">
      <div className="container">
        <div>
          <ul>
            <li>
              <a href={ONROUTE_WEBPAGE_LINKS.HOME}>Home</a>
            </li>
            <li>
              <a
                href={ONROUTE_WEBPAGE_LINKS.DISCLAIMER}
                target="_blank"
                rel="noopener noreferrer"
              >
                Disclaimer
              </a>
            </li>
            <li>
              <a
                href={ONROUTE_WEBPAGE_LINKS.PRIVACY}
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy
              </a>
            </li>
            <li>
              <a
                href={ONROUTE_WEBPAGE_LINKS.ACCESSIBILITY}
                target="_blank"
                rel="noopener noreferrer"
              >
                Accessibility
              </a>
            </li>
            <li>
              <a
                href={ONROUTE_WEBPAGE_LINKS.COPYRIGHT}
                target="_blank"
                rel="noopener noreferrer"
              >
                Copyright
              </a>
            </li>
            <li>
              <a
                href={ONROUTE_WEBPAGE_LINKS.CONTACT_US}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact Us
              </a>
            </li>
            <li>
              <span>{releaseNumber}</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
