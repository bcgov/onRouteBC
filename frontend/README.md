#  onRouteBC Frontend

This project was bootstrapped with [Vite](https://vitejs.dev/).

## Technologies Used

- React with Typescript
- Material UI
- [Tanstack React Query](https://tanstack.com/query/v3/)
- [React Hook Forms](https://react-hook-form.com/)
- [Material React Table](https://www.material-react-table.com/)

## Getting Started

### Environment Variables

Create a .env file in the root directory of onRouteBC and add the following variables:

```conf
VITE_DEPLOY_ENVIRONMENT=local
VITE_API_VEHICLE_URL=http://localhost:5000
VITE_POLICY_URL=http://localhost:5002
VITE_KEYCLOAK_ISSUER_URL=
VITE_KEYCLOAK_AUDIENCE=
VITE_SITEMINDER_LOG_OFF_URL=
```

### Prerequisites

#### [Node.js](https://nodejs.org/en/)

- You’ll need to have Node 20 and npm on your machine. You can use [nvm](https://github.com/nvm-sh/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to switch Node versions between different projects.
- Note: We are using Node 20.11.0-alpine as a base image on our pipeline.

### Installation

In the project directory, you can run:

### `npm install`

Install all frontend dependencies

### `npm start`

Runs the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

These tests are provided for reference only and do not represent full coverage.

Unit tests are written using [vitest](https://vitest.dev/guide/why.html)

### `npm run test:cov`

Launches the test runner and provides a test coverage report.
