SET NOCOUNT ON
IF OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_ERROR_TYPE]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_ERROR]', 'U') IS NOT NULL 
    SELECT 1 
ELSE
    SELECT 0