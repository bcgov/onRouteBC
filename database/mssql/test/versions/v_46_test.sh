#!/bin/bash

# Retrieve arguments
source ${SCRIPT_DIR}/utility/getopt.sh
USAGE="-u USER -p PASS -s SERVER -d DATABASE"
parse_options "${USAGE}" ${@}

# All database tests for database version 46 are run from this shell script.
# TESTS_DIR variable set by the calling test-runner script.

TEST_46_1_RESULT=$(/opt/mssql-tools/bin/sqlcmd -U ${USER} -P "${PASS}" -S ${SERVER} -v DB_NAME=${DATABASE} -h -1 -i ${TESTS_DIR}/v_46_1_test.sql | xargs)
if [[ $TEST_46_1_RESULT -eq 1 ]]; then
    echo "Test 46.1 passed: GL type and GL code type tables exist."
else
    echo "******** Test 46.1 failed: Missing either GL type or GL code type table."
fi
