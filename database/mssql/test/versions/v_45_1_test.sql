-- Test that the GL_PROJ_CODE column has been added correctly
SET NOCOUNT ON

select COL_LENGTH('$(DB_NAME).[permit].[ORBC_PAYMENT_METHOD_TYPE]', 'GL_PROJ_CODE')
