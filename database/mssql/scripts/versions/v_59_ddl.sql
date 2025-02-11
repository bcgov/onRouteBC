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
DECLARE @NewGuid UNIQUEIDENTIFIER
SET @NewGuid =NEWID();
INSERT [dops].[ORBC_DOCUMENT] ( 
    [S3_OBJECT_ID], 
    [S3_VERSION_ID], 
    [S3_LOCATION], 
    [OBJECT_MIME_TYPE], 
    [FILE_NAME], 
    [DMS_VERSION_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
)
VALUES (
    @NewGuid,
    NULL,
    N'https://moti-int.objectstore.gov.bc.ca/tran_api_orbc_docs_dev/tran_api_orbc_docs_dev@moti-int.objectstore.gov.bc.ca/' + CONVERT(NVARCHAR(36), @NewGuid),
    N'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    N'qrfr-template-v1.docx',
    1,
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)


INSERT [dops].[ORBC_DOCUMENT_TEMPLATE] ( 
    [TEMPLATE_NAME], 
    [TEMPLATE_VERSION], 
    [DOCUMENT_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
) 
VALUES (
    N'PERMIT_QRFR',
    1,
    (SELECT ID FROM [dops].[ORBC_DOCUMENT] WHERE FILE_NAME = 'qrfr-template-v1.docx'),
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)

SET @NewGuid = NEWID();


INSERT [dops].[ORBC_DOCUMENT] ( 
    [S3_OBJECT_ID], 
    [S3_VERSION_ID], 
    [S3_LOCATION], 
    [OBJECT_MIME_TYPE], 
    [FILE_NAME], 
    [DMS_VERSION_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
)
VALUES (
    @NewGuid,
    NULL,
    N'https://moti-int.objectstore.gov.bc.ca/tran_api_orbc_docs_dev/tran_api_orbc_docs_dev@moti-int.objectstore.gov.bc.ca/' + CONVERT(NVARCHAR(36), @NewGuid),
    N'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    N'qrfr-void-template-v1.docx',
    1,
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)

INSERT [dops].[ORBC_DOCUMENT_TEMPLATE] ( 
    [TEMPLATE_NAME], 
    [TEMPLATE_VERSION], 
    [DOCUMENT_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
) 
VALUES (
    N'PERMIT_QRFR_VOID',
    1,
    (SELECT ID FROM [dops].[ORBC_DOCUMENT] WHERE FILE_NAME = 'qrfr-void-template-v1.docx'),
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)

SET @NewGuid = NEWID();

INSERT [dops].[ORBC_DOCUMENT] ( 
    [S3_OBJECT_ID], 
    [S3_VERSION_ID], 
    [S3_LOCATION], 
    [OBJECT_MIME_TYPE], 
    [FILE_NAME], 
    [DMS_VERSION_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
)
VALUES (
    @NewGuid,
    NULL,
    N'https://moti-int.objectstore.gov.bc.ca/tran_api_orbc_docs_dev/tran_api_orbc_docs_dev@moti-int.objectstore.gov.bc.ca/' + CONVERT(NVARCHAR(36), @NewGuid),
    N'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    N'qrfr-revoked-template-v1.docx',
    1,
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)

INSERT [dops].[ORBC_DOCUMENT_TEMPLATE] ( 
    [TEMPLATE_NAME], 
    [TEMPLATE_VERSION], 
    [DOCUMENT_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
) 
VALUES (
    N'PERMIT_QRFR_REVOKED',
    1,
    (SELECT ID FROM [dops].[ORBC_DOCUMENT] WHERE FILE_NAME = 'qrfr-revoked-template-v1.docx'),
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)

SET @NewGuid =NEWID();
INSERT [dops].[ORBC_DOCUMENT] ( 
    [S3_OBJECT_ID], 
    [S3_VERSION_ID], 
    [S3_LOCATION], 
    [OBJECT_MIME_TYPE], 
    [FILE_NAME], 
    [DMS_VERSION_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
)
VALUES (
    @NewGuid,
    NULL,
    N'https://moti-int.objectstore.gov.bc.ca/tran_api_orbc_docs_dev/tran_api_orbc_docs_dev@moti-int.objectstore.gov.bc.ca/' + CONVERT(NVARCHAR(36), @NewGuid),
    N'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    N'stfr-template-v1.docx',
    1,
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)


INSERT [dops].[ORBC_DOCUMENT_TEMPLATE] ( 
    [TEMPLATE_NAME], 
    [TEMPLATE_VERSION], 
    [DOCUMENT_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
) 
VALUES (
    N'PERMIT_STFR',
    1,
    (SELECT ID FROM [dops].[ORBC_DOCUMENT] WHERE FILE_NAME = 'stfr-template-v1.docx'),
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)

SET @NewGuid = NEWID();


INSERT [dops].[ORBC_DOCUMENT] ( 
    [S3_OBJECT_ID], 
    [S3_VERSION_ID], 
    [S3_LOCATION], 
    [OBJECT_MIME_TYPE], 
    [FILE_NAME], 
    [DMS_VERSION_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
)
VALUES (
    @NewGuid,
    NULL,
    N'https://moti-int.objectstore.gov.bc.ca/tran_api_orbc_docs_dev/tran_api_orbc_docs_dev@moti-int.objectstore.gov.bc.ca/' + CONVERT(NVARCHAR(36), @NewGuid),
    N'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    N'stfr-void-template-v1.docx',
    1,
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)

INSERT [dops].[ORBC_DOCUMENT_TEMPLATE] ( 
    [TEMPLATE_NAME], 
    [TEMPLATE_VERSION], 
    [DOCUMENT_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
) 
VALUES (
    N'PERMIT_STFR_VOID',
    1,
    (SELECT ID FROM [dops].[ORBC_DOCUMENT] WHERE FILE_NAME = 'stfr-void-template-v1.docx'),
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)

SET @NewGuid = NEWID();

INSERT [dops].[ORBC_DOCUMENT] ( 
    [S3_OBJECT_ID], 
    [S3_VERSION_ID], 
    [S3_LOCATION], 
    [OBJECT_MIME_TYPE], 
    [FILE_NAME], 
    [DMS_VERSION_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
)
VALUES (
    @NewGuid,
    NULL,
    N'https://moti-int.objectstore.gov.bc.ca/tran_api_orbc_docs_dev/tran_api_orbc_docs_dev@moti-int.objectstore.gov.bc.ca/' + CONVERT(NVARCHAR(36), @NewGuid),
    N'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    N'stfr-revoked-template-v1.docx',
    1,
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)

INSERT [dops].[ORBC_DOCUMENT_TEMPLATE] ( 
    [TEMPLATE_NAME], 
    [TEMPLATE_VERSION], 
    [DOCUMENT_ID], 
    [CONCURRENCY_CONTROL_NUMBER], 
    [DB_CREATE_USERID], 
    [DB_CREATE_TIMESTAMP], 
    [DB_LAST_UPDATE_USERID], 
    [DB_LAST_UPDATE_TIMESTAMP]
) 
VALUES (
    N'PERMIT_STFR_REVOKED',
    1,
    (SELECT ID FROM [dops].[ORBC_DOCUMENT] WHERE FILE_NAME = 'stfr-revoked-template-v1.docx'),
    1,
    N'dops',
    GETUTCDATE(),
    N'dops',
    GETUTCDATE()
)

IF @@ERROR <> 0 SET NOEXEC ON
GO

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Configure ICBC (QRFR & STFR) permit templates'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [UPDATE_SCRIPT], [REVERT_SCRIPT], [RELEASE_DATE]) VALUES (59, @VersionDescription, '$(UPDATE_SCRIPT)', '$(REVERT_SCRIPT)', getutcdate())
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
