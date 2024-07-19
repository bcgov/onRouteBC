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

IF @@ERROR <> 0
   SET NOEXEC ON
GO

INSERT [access].[ORBC_ROLE_TYPE] ([ROLE_TYPE], [ROLE_DESCRIPTION]) VALUES (N'ORBC-WRITE-POLICY-CONFIG', NULL)
INSERT [access].[ORBC_ROLE_TYPE] ([ROLE_TYPE], [ROLE_DESCRIPTION]) VALUES (N'ORBC-READ-POLICY-CONFIG', NULL)
GO

INSERT [access].[ORBC_GROUP_ROLE] ([USER_AUTH_GROUP_TYPE], [ROLE_TYPE]) VALUES (N'SYSADMIN', N'ORBC-WRITE-POLICY-CONFIG')
INSERT [access].[ORBC_GROUP_ROLE] ([USER_AUTH_GROUP_TYPE], [ROLE_TYPE]) VALUES (N'SYSADMIN', N'ORBC-READ-POLICY-CONFIG')

ALTER TABLE [dbo].[ORBC_POLICY_CONFIGURATION] ADD [APP_LAST_UPDATE_USERID] [nvarchar](30) NULL
GO

ALTER TABLE [dbo].[ORBC_POLICY_CONFIGURATION] ADD  CONSTRAINT [DF_ORBC_POLICY_CONFIGURATION_IS_DRAFT]  DEFAULT ('Y') FOR [IS_DRAFT]
GO

IF @@ERROR <> 0 SET NOEXEC ON
GO

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Add APP_LAST_UPDATE_USERID cols to ORBC_POLICY_CONFIGURATION'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [UPDATE_SCRIPT], [REVERT_SCRIPT], [RELEASE_DATE]) VALUES (32, @VersionDescription, '$(UPDATE_SCRIPT)', '$(REVERT_SCRIPT)', getutcdate())
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