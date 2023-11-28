SET NOCOUNT ON
IF OBJECT_ID('[$(DB_NAME)].[permit].[ORBC_TRANSACTION]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[permit].[ORBC_TRANSACTION_TYPE]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[permit].[ORBC_PERMIT_TRANSACTION]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[permit].[ORBC_RECEIPT]', 'U') IS NOT NULL
AND OBJECT_ID('[$(DB_NAME)].[permit].[ORBC_PAYMENT_METHOD_TYPE]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[permit].[ORBC_PAYMENT_CARD_TYPE]', 'U') IS NOT NULL 
    SELECT 1 
ELSE
    SELECT 0