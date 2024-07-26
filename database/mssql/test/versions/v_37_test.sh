#!/bin/bash

# Retrieve arguments
source ${SCRIPT_DIR}/utility/getopt.sh
USAGE="-u USER -p PASS -s SERVER -d DATABASE"
parse_options "${USAGE}" ${@}

# All database tests for database version 37 are run from this shell script.
# TESTS_DIR variable set by the calling test-runner script.

TEST_37_1_RESULT=$(/opt/mssql-tools/bin/sqlcmd -U ${USER} -P "${PASS}" -S ${SERVER} -v DB_NAME=${DATABASE} -h -1 -i ${TESTS_DIR}/v_37_1_test.sql | xargs)
if [[ $TEST_37_1_RESULT -eq 1 ]]; then
    echo "Test 37.1 passed: Special auth tables are create correctly"
else
    echo "******** Test 37.1 failed: Special auth tables are not create correctly"
fi