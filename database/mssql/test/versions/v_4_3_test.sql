SET NOCOUNT ON

SET IDENTITY_INSERT $(DB_NAME).[dbo].[ORBC_ADDRESS] ON
INSERT $(DB_NAME).[dbo].[ORBC_ADDRESS] ([ADDRESS_ID], [ADDRESS_LINE_1], [ADDRESS_LINE_2], [CITY], [PROVINCE_ID], [POSTAL_CODE]) VALUES (201, N'21136 Railway Ave S', NULL, N'Mission', N'CA-BC', N'V2S 2A8')
SET IDENTITY_INSERT $(DB_NAME).[dbo].[ORBC_ADDRESS] OFF

SET IDENTITY_INSERT $(DB_NAME).[dbo].[ORBC_COMPANY] ON 
INSERT $(DB_NAME).[dbo].[ORBC_COMPANY] ([COMPANY_ID], [COMPANY_GUID], [CLIENT_NUMBER], [LEGAL_NAME], [COMPANY_DIRECTORY], [PHYSICAL_ADDRESS_ID], [MAILING_ADDRESS_ID], [PHONE], [EXTENSION], [FAX], [EMAIL]) VALUES (1, N'C16A95599A264242A850BDDC21B739F4', N'R2-000080-380',N'Ewing Transport Inc.', N'BBCEID', 201, 201, N'778-937-6018', NULL, NULL, N'info@ewingtransport.ca')
SET IDENTITY_INSERT $(DB_NAME).[dbo].[ORBC_COMPANY] OFF

SET IDENTITY_INSERT $(DB_NAME).[permit].[ORBC_PERMIT] ON 
INSERT INTO $(DB_NAME).permit.ORBC_PERMIT(ID, COMPANY_ID, PERMIT_TYPE_ID, APPLICATION_ORIGIN_ID) VALUES(33, 1, 'TROS', 'ONLINE')
SET IDENTITY_INSERT $(DB_NAME).[permit].[ORBC_PERMIT] OFF

SELECT PERMIT_STATUS_ID FROM $(DB_NAME).permit.ORBC_PERMIT_STATE WHERE PERMIT_ID = 33

-- Clean up
DELETE FROM $(DB_NAME).[permit].[ORBC_PERMIT_STATE]
DELETE FROM $(DB_NAME).[permit].[ORBC_PERMIT]
DELETE FROM $(DB_NAME).[dbo].[ORBC_COMPANY]
DELETE FROM $(DB_NAME).[dbo].[ORBC_ADDRESS]