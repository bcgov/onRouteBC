# Policy Validation Result Reference

## Validating a Permit Application
Permits are validated with the policy engine by supplying the permit JSON to the `validate` method of an instantiated policy object. A policy object is instantiated by passing a policy configuration JSON object to the `Policy` constructor. Refer to the Policy Configuration Reference documentation for information about the structure of the policy configuration JSON object.

The `validate` method returns an object of type `ValidationResults` which has 5 properties: `violations`, `requirements`, `warnings`, `information`, and `cost`. Each of these properties is an array of `ValidationResult` objects.

Currently in onroute only the `violations` and `cost` properties are used. In the future, `requirements`, `warnings`, and `information` will be added. For now those properties may be ignored.

### Valid Permit Applications
A valid permit application is one whose `ValidationResults` has an empty `violations` array. That is, no policy violations were found in the permit application. Here is an example:

```js
{
   "violations": [],
   "requirements": [],
   "warnings": [],
   "information": [],
   "cost": [
      {
         "type": "cost",
         "code": "cost-value",
         "message": "Calculated permit cost",
         "cost": 30
      }
   ]
}
```

## Violations
If at least one `ValidationResult` is present in the `violations` property of the result, the permit application has failed the policy check.

The `ValidationResult` will typically contain information about what the nature of the violation was. Here is an example:

```js
  "violations": [
    {
        "type": "violation",
        "code": "field-validation-error",
        "message": "Duration must be in 30 day increments or a full year",
        "fieldReference": "permitData.permitDuration"
    }
  ],
```
In the example above, the permit duration in the permit application JSON was 31 days, which is invalid according to the rules specified for the permit type (TROS in this case).

All of the properties of the violation are configured directly in the policy configuration JSON file, and are taken verbatim from there. To change the message presented for this violation, simply update the policy configuration JSON.

### type
Violation `ValidationResult` objects will always have a type of `violation`.

### code
The `code` property indicates the nature of the violation, which may be used by the calling application. For example, a `field-validation-error` may cause the frontend form to highlight the form element and present the message underneath in red text.

### message
The `message` property is a friendly description of the cause of the violation.

### fieldReference
The `fieldReference` property indicates the specific field which caused the violation, and can be used in conjunction with `code` to provide context to a user in the frontend.

## Cost
To calculate the cost of a permit, validate it using the policy engine's `validate` method. The validation result will include a `cost` property specifying the cost of the permit.

Any permit with a cost greater than zero will have at least one `ValidationResult` in the `cost` array of the `ValidationResults` object. Here is an example of a valid one year term oversize permit:

```js
{
   "violations": [],
   "requirements": [],
   "warnings": [],
   "information": [],
   "cost": [
      {
         "type": "cost",
         "code": "cost-value",
         "message": "Calculated permit cost",
         "cost": 360
      }
   ]
}
```
The `type` will always be `cost`, `code` will always be `cost-value`, and `message` will always be `Calculated permit cost`. These may be ignored.

The `cost` property indicates the permit cost in Canadian dollars, based on the details in the permit application itself.

It is possible that there are multiple `cost` results. In this case, it is up to the calling application to add all of the `cost` properties together for a final permit cost.

> [!NOTE]
> The reason there may be multiple `cost` results is that some permit types have both a fixed cost (minimum permit cost) as well as a cost based on kilometres driven. Since these are calculated independently they are added separately to the `cost` array. Typically there is no need for the onroute application to break down the permit cost into its constituent parts so only the sum is used.