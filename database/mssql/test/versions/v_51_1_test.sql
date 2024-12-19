-- Test that the ORIGIN_ID column has been created successfully
SET NOCOUNT ON

select COL_LENGTH('$(DB_NAME).[dbo].[ORBC_POLICY_CONFIGURATION]', 'ORIGIN_ID')
