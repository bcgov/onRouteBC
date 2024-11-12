SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO

SET XACT_ABORT ON
GO
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
BEGIN TRANSACTION
GO

/*
The following DELETE statement is intentionally commented out.
This is because, these permit types are a permanent part of the production db
and there is no expectation that they will be deleted at any point.

If at all needed, the following query can be executed manually in prod at the team's discretion.

IMPORTANT: Analyze the impact from foreign key constraints in child tables
before deleting the permit types.

*/

-- DELETE FROM [permit].[ORBC_PERMIT_TYPE] WHERE PERMIT_TYPE IN ('QRFR', 'STFR')
-- GO


IF @@ERROR <> 0 SET NOEXEC ON
GO

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Reverting adding QRFR and STFR permit types to ORBC_PERMIT_TYPE table'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [RELEASE_DATE]) VALUES (47, @VersionDescription, getutcdate())

IF @@ERROR <> 0 SET NOEXEC ON
GO

COMMIT TRANSACTION
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
DECLARE @Success AS BIT
SET @Success = 1
SET NOEXEC OFF
IF (@Success = 1) PRINT 'The database revert succeeded'
ELSE BEGIN
   IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
   PRINT 'The database revert failed'
END
GO