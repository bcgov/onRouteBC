SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO
BEGIN TRANSACTION

ALTER TABLE [permit].ORBC_PERMIT_TRANSACTION DROP CONSTRAINT [FK_ORBC_PERMIT_TRANSACTION_PERMIT_ID]
ALTER TABLE [permit].ORBC_PERMIT_TRANSACTION DROP CONSTRAINT [FK_ORBC_PERMIT_TRANSACTION_TRANSACTION_ID]
DROP TABLE [permit].[ORBC_PERMIT_TRANSACTION]
DROP TABLE [permit].[ORBC_TRANSACTION]
DROP TABLE [permit].[ORBC_VT_PAYMENT_METHOD]


DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Reverting initial creation of entities for Payment.'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [DDL_FILE_SHA1], [RELEASE_DATE]) VALUES (6, @VersionDescription, '$(FILE_HASH)', getutcdate())

COMMIT