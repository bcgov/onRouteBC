#!/bin/bash

# Retrieve arguments
source ${SCRIPT_DIR}/utility/getopt.sh
USAGE="-u USER -p PASS -s SERVER -d DATABASE"
parse_options "${USAGE}" ${@}

# All database tests for database version 45 are run from this shell script.
# TESTS_DIR variable set by the calling test-runner script.

TEST_45_1_RESULT=$(/opt/mssql-tools/bin/sqlcmd -U ${USER} -P "${PASS}" -S ${SERVER} -v DB_NAME=${DATABASE} -h -1 -i ${TESTS_DIR}/v_45_1_test.sql | xargs)
if [[ $TEST_45_1_RESULT -eq 7 ]]; then
    echo "Test 45.1 passed: GL_PROJ_CODE column created in ORBC_PAYMENT_METHOD_TYPE"
else
    echo "******** Test 45.1 failed: GL_PROJ_CODE column missing in ORBC_PAYMENT_METHOD_TYPE"
fi
