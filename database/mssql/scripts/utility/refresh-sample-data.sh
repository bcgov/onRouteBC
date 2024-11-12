#!/bin/bash

# Retrieve arguments
source ${SCRIPT_DIR}/utility/getopt.sh
USAGE="-u ORBC_USER -p ORBC_PASS -s ORBC_SERVER -d ORBC_DATABASE"
parse_options "${USAGE}" ${@}

echo "Deleting existing sample data"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -Q "SET NOCOUNT ON; DELETE FROM dbo.ORBC_FEATURE_FLAG"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -Q "SET NOCOUNT ON; DELETE FROM dbo.ORBC_TRAILER"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -Q "SET NOCOUNT ON; DELETE FROM dbo.ORBC_POWER_UNIT"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -Q "SET NOCOUNT ON; DELETE FROM dbo.ORBC_COMPANY_USER"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -Q "SET NOCOUNT ON; DELETE FROM dbo.ORBC_USER"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -Q "SET NOCOUNT ON; DELETE FROM dbo.ORBC_COMPANY"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -Q "SET NOCOUNT ON; DELETE FROM dbo.ORBC_CONTACT"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -Q "SET NOCOUNT ON; DELETE FROM dbo.ORBC_ADDRESS"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -Q "SET NOCOUNT ON; DELETE FROM dbo.ORBC_POLICY_CONFIGURATION"
echo "Finished deleting existing sample data"

echo "Loading sample data...please wait"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i ${SCRIPT_DIR}/sampledata/dbo.ORBC_ADDRESS.Table.sql
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i ${SCRIPT_DIR}/sampledata/dbo.ORBC_CONTACT.Table.sql
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i ${SCRIPT_DIR}/sampledata/dbo.ORBC_COMPANY.Table.sql
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i ${SCRIPT_DIR}/sampledata/dbo.ORBC_USER.Table.sql
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i ${SCRIPT_DIR}/sampledata/dbo.ORBC_COMPANY_USER.Table.sql
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i ${SCRIPT_DIR}/sampledata/dbo.ORBC_POWER_UNIT.Table.sql
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i ${SCRIPT_DIR}/sampledata/dbo.ORBC_TRAILER.Table.sql
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i ${SCRIPT_DIR}/sampledata/dbo.ORBC_FEATURE_FLAG.Table.sql
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i ${SCRIPT_DIR}/sampledata/dbo.ORBC_POLICY_CONFIGURATION.Table.sql

echo "Setting credit account sequence restart to current timestamp (used only for lower environments)"
sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i ${SCRIPT_DIR}/sampledata/permit.ORBC_CREDIT_ACCOUNT_NUMBER_SEQ.sql

if [ -d "${SCRIPT_DIR}/sampledata/_private_sql" ] 
then
  echo "Running private SQL (non-repository)"
  for f in ${SCRIPT_DIR}/sampledata/_private_sql/*.sql; 
  do 
    echo "Processing $f file..."; 
    sqlcmd -C -U ${ORBC_USER} -P "${ORBC_PASS}" -S ${ORBC_SERVER} -d ${ORBC_DATABASE} -i $f
  done
fi

echo "Finished loading sample data"
