SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO

SET XACT_ABORT ON
GO
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
GO
BEGIN TRANSACTION
GO

IF @@ERROR <> 0 SET NOEXEC ON
GO
DELETE FROM [access].[ORBC_GROUP_ROLE] WHERE ROLE_TYPE IN ('ORBC-SEND-NOTIFICATION')

IF @@ERROR <> 0 SET NOEXEC ON
GO
DELETE FROM [access].[ORBC_ROLE_TYPE] WHERE ROLE_TYPE IN ('ORBC-SEND-NOTIFICATION')

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Revert ORBC-SEND-NOTIFICATION role'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [RELEASE_DATE]) VALUES (24, @VersionDescription, getutcdate())
IF @@ERROR <> 0 SET NOEXEC ON
GO

COMMIT TRANSACTION
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
DECLARE @Success AS BIT
SET @Success = 1
SET NOEXEC OFF
IF (@Success = 1) PRINT 'The database update succeeded'
ELSE BEGIN
   IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
   PRINT 'The database update failed'
END
GO

