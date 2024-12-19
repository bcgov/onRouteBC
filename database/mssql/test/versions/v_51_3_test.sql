-- Test that the initial policy configuration has been inserted correctly
SET NOCOUNT ON

SELECT COUNT(*) FROM $(DB_NAME).[dbo].[ORBC_POLICY_CONFIGURATION] 
