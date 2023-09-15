SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO

DROP TABLE [permit].[ORBC_PERMIT_TRANSACTION]
DROP TABLE [permit].[ORBC_RECEIPT]
DROP TABLE [permit].[ORBC_TRANSACTION]
DROP TABLE [permit].[ORBC_VT_PAYMENT_METHOD]
DROP SEQUENCE [permit].[ORBC_RECEIPT_NUMBER_SEQ]
DROP SEQUENCE [permit].[ORBC_TRANSACTION_NUMBER_SEQ]


DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Reverting initial creation of entities for Payment.'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [DDL_FILE_SHA1], [RELEASE_DATE]) VALUES (6, @VersionDescription, '$(FILE_HASH)', getutcdate())
