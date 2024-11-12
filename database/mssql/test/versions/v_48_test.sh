#!/bin/bash

# Retrieve arguments
source ${SCRIPT_DIR}/utility/getopt.sh
USAGE="-u USER -p PASS -s SERVER -d DATABASE"
parse_options "${USAGE}" ${@}

# All database tests for database version 48 are run from this shell script.
# TESTS_DIR variable set by the calling test-runner script.

TEST_48_1_RESULT=$(/opt/mssql-tools/bin/sqlcmd -U ${USER} -P "${PASS}" -S ${SERVER} -v DB_NAME=${DATABASE} -h -1 -i ${TESTS_DIR}/v_48_1_test.sql | xargs)
if [[ $TEST_48_1_RESULT -eq 2 ]]; then
    echo "Test 48.1 passed: QRFR and STFR permit types exist."
else
    echo "******** Test 48.1 failed: QRFR and STFR permit types do not exist."
fi
