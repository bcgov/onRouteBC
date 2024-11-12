-- Test that the permit template have been configured correctly
SET NOCOUNT ON

SELECT COUNT(*) FROM $(DB_NAME).[dops].[ORBC_DOCUMENT_TEMPLATE] 
WHERE TEMPLATE_NAME IN ('PERMIT','PERMIT_STOS_VOID','PERMIT_STOS_REVOKED')
