-- Test that the permit name has been configured correctly
SET NOCOUNT ON

SELECT COUNT(*) FROM $(DB_NAME).[permit].[ORBC_PERMIT_TYPE] 
WHERE NAME='Motive Fuel User Permit'