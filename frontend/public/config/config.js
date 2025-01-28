/**
 * Inject environment variables into React at runtime.
 *
 * This function is used as a placeholder for env variables.
 *
 * Once deployed, env variables are injected into this function,
 * then they can be accessed in the application.
 *
 * See the following links for reference:
 * https://stackoverflow.developer.gov.bc.ca/questions/143
 * https://javaadpatel.com/building-and-deploying-react-containers/
 *
 * TODO: How to make env variable work in docker compose
 * Currently, the default values shown below are used
 * in the docker compose environment
 */
const envConfig = (() => {
  return {
    VITE_DEPLOY_ENVIRONMENT: "docker",
    VITE_API_VEHICLE_URL: "http://localhost:5000",
    VITE_KEYCLOAK_ISSUER_URL: "",
    VITE_KEYCLOAK_AUDIENCE: "",
    VITE_SITEMINDER_LOG_OFF_URL: "",
    VITE_FRONTEND_PR_NUM: "",
    VITE_POLICY_URL: "",
    VITE_RELEASE_NUM: "",
  };
})();
