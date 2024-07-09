SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO

SET XACT_ABORT ON

BEGIN TRY
  BEGIN TRANSACTION
    DROP TABLE [permit].[ORBC_LOA_PERMIT_TYPE_DETAILS]
    DROP TABLE [permit].[ORBC_LOA_VEHICLES]
    DROP TABLE [permit].[ORBC_LOA_DETAILS]
    DROP SEQUENCE [permit].[ORBC_LOA_NUMBER_SEQ]
  COMMIT
END TRY

BEGIN CATCH
  IF @@TRANCOUNT > 0 
    ROLLBACK;
  THROW
END CATCH

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Reverting initial creation of LOA tables.'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [RELEASE_DATE]) VALUES (31, @VersionDescription, getutcdate())
