-- Test that the auth groups have been inserted correctly
SET NOCOUNT ON

SELECT COUNT(*) FROM $(DB_NAME).[permit].[ORBC_PERMIT_TYPE] 
WHERE PERMIT_TYPE IN ('STFR', 'QRFR')
