// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "vitest-canvas-mock";

(global as any).envConfig = (() => {
  return {
    VITE_DEPLOY_ENVIRONMENT: "docker",
    VITE_API_VEHICLE_URL: "http://localhost:5000",
    VITE_POLICY_URL: "http://localhost:5002",
  };
})();
