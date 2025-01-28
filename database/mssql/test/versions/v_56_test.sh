#!/bin/bash

# Retrieve arguments
source ${SCRIPT_DIR}/utility/getopt.sh
USAGE="-u USER -p PASS -s SERVER -d DATABASE"
parse_options "${USAGE}" ${@}

# All database tests for database version 56 are run from this shell script.
# TESTS_DIR variable set by the calling test-runner script.

TEST_56_1_RESULT=$(/opt/mssql-tools/bin/sqlcmd -U ${USER} -P "${PASS}" -S ${SERVER} -v DB_NAME=${DATABASE} -h -1 -i ${TESTS_DIR}/v_56_1_test.sql | xargs)
if [[ $TEST_56_1_RESULT -eq 1 ]]; then
    echo "Test 56.1 passed: MV4001 form configured correctly"
else
    echo "******** Test 56.1 failed: MV4001 form configuration failure"
fi