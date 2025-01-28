-- Test that the MV4001 form has been configured correctly
SET NOCOUNT ON

SELECT COUNT(*) FROM $(DB_NAME).[dops].[ORBC_EXTERNAL_DOCUMENT] 
WHERE DOCUMENT_NAME IN ('MV4001')