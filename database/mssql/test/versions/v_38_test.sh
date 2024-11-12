#!/bin/bash

# Retrieve arguments
source ${SCRIPT_DIR}/utility/getopt.sh
USAGE="-u USER -p PASS -s SERVER -d DATABASE"
parse_options "${USAGE}" ${@}

# All database tests for database version 32 are run from this shell script.
# TESTS_DIR variable set by the calling test-runner script.

TEST_38_1_RESULT=$(/opt/mssql-tools/bin/sqlcmd -U ${USER} -P "${PASS}" -S ${SERVER} -v DB_NAME=${DATABASE} -h -1 -i ${TESTS_DIR}/v_38_1_test.sql | xargs)
# Returns 24 for an nvarchar(12) data type due to larger nvarchar storage
if [[ $TEST_38_1_RESULT -eq 24 ]]; then
    echo "Test 38.1 passed: CREDIT_ACCOUNT_NUMBER column length updated correctly"
else
    echo "******** Test 38.1 failed: CREDIT_ACCOUNT_NUMBER column length not updated correctly: "
    echo $TEST_38_1_RESULT
fi