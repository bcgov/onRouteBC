-- Test that the IS_PRIMARY_DRAFT column has been created
SET NOCOUNT ON

select COL_LENGTH('$(DB_NAME).[dbo].[ORBC_POLICY_CONFIGURATION]', 'IS_PRIMARY_DRAFT')
