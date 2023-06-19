SET NOCOUNT ON
IF OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_ADDRESS]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_IDIR_USER]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_PENDING_IDIR_USER]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_COMPANY]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_COMPANY_USER]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_CONTACT]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[access].[ORBC_GROUP_ROLE]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_PENDING_USER]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_USER]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_VT_DIRECTORY]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[access].[ORBC_VT_ROLE]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[access].[ORBC_VT_USER_AUTH_GROUP]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(DB_NAME)].[dbo].[ORBC_VT_USER_STATUS]', 'U') IS NOT NULL 
    SELECT 1 
ELSE
    SELECT 0