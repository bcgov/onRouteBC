SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO

SET XACT_ABORT ON

BEGIN TRY
  BEGIN TRANSACTION
    DROP TABLE [tps].[ORBC_TPS_MIGRATED_PERMITS]
    DROP TABLE [tps].[LEGACY_TPS_CLIENT_DATA]
    DROP SCHEMA [tps]
  COMMIT
END TRY

BEGIN CATCH
  IF @@TRANCOUNT > 0 
    ROLLBACK;
  THROW
END CATCH

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Reverting creation of tables to store TPS migration staging data.'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [RELEASE_DATE]) VALUES (8, @VersionDescription, getutcdate())
