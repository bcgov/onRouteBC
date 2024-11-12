A JSON-based rules engine to validate onRouteBC permit applications against commercial vehicle policy.

## Synopsis
```orbc-policy-engine``` is a library designed to compare a commercial vehicle permit application against policy expressed in JSON format, and return a list of policy violations as well as other informational policy messages related to the permit.

```orbc-policy-engine``` makes use of https://github.com/CacheControl/json-rules-engine for rules engine functionality. Complex rules are modeled by extending the core ```json-rules-engine``` operators and other capabilities.

## Usage
```js
import Policy from 'orbc-policy-engine';

// Instantiate a new Policy object
// policyDefinition is a JSON object of type PolicyDefinition
const policy: Policy = new Policy(policyDefinition);

// Get list of all available permit types (ID and name)
const permitTypes: Map<string, string> = policy.getPermitTypes();

// Get list of all available commodities (ID and name)
const commodities: Map<string, string> = policy.getCommodities();

// Get list of all available power unit types
const powerUnits: Map<string, string> = policy.getPowerUnitTypes();

// Get list of all available trailer types
const trailers: Map<string, string> = policy.getTrailerTypes();

// Get list of all valid commodities for a given permit type
const commodities: Map<string, string> = policy.getCommodities(permitTypeId);

// Get list of all vehicle types valid to be added to a configuration,
// by permit type and commodity. Requires supplying the vehicles already
// added to the configuration, or empty array if starting from scratch
const allowableVehicles: Map<string, string> = policy.getNextPermittableVehicles(
  permitTypeId, 
  commodityId, 
  currentConfiguration);

// Validate a permit application against policy
// permitApplication is a JSON object of type PermitApplication
// A PermitApplication is the standard permitData object wrapped
// in an object with a permitType key. For example:
// {
//   permitType: 'TROS',
//   permitData: { ... }
// }
// Note this is an async call due to the reliance on json-rules-engine
const results: ValidationResults = await policy.validate(permitApplication);
```

