SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO
CREATE FULLTEXT CATALOG PermitDataFTCat AS DEFAULT
GO
CREATE FULLTEXT INDEX ON [permit].[ORBC_PERMIT_DATA](PERMIT_DATA) KEY INDEX PK_ORBC_PERMIT_DATA;
GO
BEGIN TRANSACTION

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Creation of full text search index on ORBC_PERMIT_DATA table.'

CREATE SEQUENCE [permit].[ORBC_TRANSACTION_NUMBER_SEQ] 
 AS [bigint]
 START WITH 1
 INCREMENT BY 1
 MINVALUE 1
 MAXVALUE 9999999999
 CACHE 
GO 

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [DDL_FILE_SHA1], [RELEASE_DATE]) VALUES (8, @VersionDescription, '$(FILE_HASH)', getutcdate())


COMMIT


