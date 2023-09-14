CREATE SCHEMA [tps]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO

CREATE TABLE [tps].[LEGACY_TPS_CLIENT_DATA](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[COMPANY_ID] [int] NULL,
	[TPS_ID] [bigint] NULL,
	[COMPANY_NAME] [varchar](50) NULL,
	[COMPANY_SUB_NAME] [varchar](50) NULL,
	[FIRST_NAME] [varchar](15) NULL,
	[MIDDLE_NAME] [varchar](15) NULL,
	[LAST_NAME] [varchar](44) NULL
) ON [PRIMARY]
GO

ALTER TABLE [tps].[LEGACY_TPS_CLIENT_DATA]  WITH CHECK ADD  CONSTRAINT [FK_LEGACY_TPS_CLIENT_DATA_COMPANY] FOREIGN KEY([COMPANY_ID])
REFERENCES [dbo].[ORBC_COMPANY] ([COMPANY_ID])
ALTER TABLE [tps].[LEGACY_TPS_CLIENT_DATA] CHECK CONSTRAINT [FK_LEGACY_TPS_CLIENT_DATA_COMPANY]
GO

CREATE TABLE [tps].[ORBC_TPS_MIGRATED_PERMITS](
	[MIGRATION_ID] [bigint] IDENTITY(1,1) NOT NULL,
	[PERMIT_TYPE] [varchar](10) NULL,
	[START_DATE] [date] NULL,
	[END_DATE] [date] NULL,
	[VOID_DATE] [datetime2](7) NULL,
	[ISSUED_DATE] [datetime2](7) NULL,
	[CLIENT_ID] int NULL,
	[PLATE] [varchar](8) NULL,
	[PERMIT_NUMBER] [varchar](11) NULL,
	[PERMIT_GENERATION] [smallint] NULL,
	[PERMIT_DOCUMENT_NAME] [varchar](60) NULL,
	[SERVICE] [varchar](8) NULL,
	[PERMIT_LAST_MODIFIED_DATE] [datetime2](7) NULL,
	[PDF] [varbinary](max) NULL,
	[SYNC_DATETIME] [datetime2](7) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Creation of tables to store TPS migration staging data.'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [DDL_FILE_SHA1], [RELEASE_DATE]) VALUES (9, @VersionDescription, '$(FILE_HASH)', getutcdate())
