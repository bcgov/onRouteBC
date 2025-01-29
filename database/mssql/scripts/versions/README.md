## Summary of Scripted Incremental Database Changes by Version

### Version 1:
- Initialize versions system table

### Version 2:
- Initial creation of schema entities for manage vehicles feature

### Version 3:
- Initial creation of schema entities for manage profile feature

### Version 4:
- Initial creation of entities for applying for and issuing permits

### Version 5:
- Initial creation of entities for generating a document

### Version 6:
- Initial creation of entities for Document Management System (DMS)

### Version 7:
- Initial creation of entities for Permit Payment

### Version 8:
- Creation of full text search index on ORBC_PERMIT_DATA table.

### Version 9:
- Creation of tables to store TPS migration staging data.

### Version 10:
- Create function to format a UTC date into Pacific time for reports.

### Version 11:
- Add audit and history tables, with triggers

### Version 12:
- Update TPS permit migration trigger.

### Version 13:
- Include auth groups HQADMIN and FINANCE

### Version 14:
- Initial creation of entities for feature flag

### Version 15:
- Allow for company suspensions

### Version 16:
- Addition of user status to company user table

### Version 17:
- Remove unused IDIRBASIC auth group

### Version 18:
- Addition of deleted status to permit status table

### Version 19:
- Merge ORBC_IDIR_USER table into ORBC_USER

### Version 20:
- Addition of new power unit type to power unit types table

### Version 21:
- Add VIN derived column to Permit Data and drop APPLICANT column

### Version 22:
- Include auth groups CTPO

### Version 23:
- Rename CVCLIENT to PAPPLICANT

### Version 24:
- Update the name of permit template documents

### Version 25:
- Add ORBC-SEND-NOTIFICATION role

### Version 26:
- Add IN_CART - shopping cart status

### Version 27:
- Create Table - ORBC_CFS_TRANSACTION_DETAIL

### Version 28:
- Objects for Credit Accounts

### Version 29:
- Policy configuration table creation plus history tables for v28 and v27

### Version 30:
- Add  Serive Account diretory type to ORBC_DIRECTORY_TYPE

### Version 31:
- Add GL_CODE col to ORBC_PERMIT_TYPE

### Version 32:
- Add APP_LAST_UPDATE_USERID cols to ORBC_POLICY_CONFIGURATION

### Version 33:
- Add ORBC-READ-CREDIT-ACCOUNT to PPCCLERK, CTPO, and HQADMIN

### Version 34:
- Add LOA related tables to database

### Version 35:
- Assign auth roles to auth groups

### Version 36:
- Credit Account roles for PAPPLICANT

### Version 37:
- Creation of orbc special authorization tables

### Version 38:
- Update credit account sequence to avoid duplicates in dev and test

### Version 39:
- Default values for  ORBC_SPECIAL_AUTH for Db related columns.

### Version 40:
- Updating no fee type column length.

### Version 41:
- Add previous loa id and original load id columns to LoA table

### Version 42:
- Case/Queue management and related Db objects.

### Version 43:
- STOS permit templates.

### Version 44:
- MFP permit templates.

### Version 45:
- Add GL_PROJ_CODE col to ORBC_PAYMENT_METHOD_TYPE

### Version 46:
- Add GL Type and GL Code Type tables

### Version 47:
- Update permit name of permit type MFP

### Version 48:
- Add QRFR and STFR permit types to ORBC_PERMIT_TYPE table

### Version 49:
- Add index to permit history table to resolve deadlocks

### Version 50:
- Add indexes to all foreign key columns and permit sort columns

### Version 51:
- Updates to policy configuration table for config versioning

### Version 52:
- Updates to policy configuration JSON for lcv

### Version 53:
- Update all permit templates to v2 to fix rev history

### Version 54:
- Alter table permit.ORBC_RECEIPT:
  - Drop foreign key column TRANSACTION_ID
  - Alter trigger ORBC_RCPT_A_S_IUD_TR to remove column TRANSACTION_ID references
  - Alter (disabled) trigger ORBC_RCPT_I_S_U_TR to remove column TRANSACTION_ID references

- Alter table permit.ORBC_RECEIPT_HIST:
  - Make column TRANSACTION_ID nullable

- Alter table permit.ORBC_TRANSACTION:
  - Add indexed optional foreign key referencing permit.ORBC_RECEIPT
  - Alter trigger ORBC_TXN_A_S_IUD_TR to include column RECEIPT_ID (this is my guess about how it has changed)
  - Alter (disabled) trigger ORBC_TXN_I_S_U_TR to include column RECEIPT_ID (this is my guess about how it has changed)
  - Initialize value of new column RECEIPT_ID

- Alter table permit.ORBC_TRANSACTION_HIST:
  - Add nullable column RECEIPT_ID

- Add version 54 row to dbo.ORBC_SYS_VERSION ("Add RECEIPT_ID col to ORBC_TRANSACTION and Drop TRANSACTION_ID from ORBC_RECEIPT")

### Version 55:
- Updates to policy configuration JSON allowing lcv for TROS and TROW

### Version 56:
- Configure the MV4001 external form in OnRouteBC

### Version 57:
- Configure new templates for TROS and TROW

### Version 58:
- Updates to support new vehicle types for TROS and TROW